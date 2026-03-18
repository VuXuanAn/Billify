import { supabase } from '../supabase'

export interface Member {
  id: string
  name: string
}

export interface Item {
  id: string
  name: string
  amount: number
}

export interface Donation {
  id: string
  memberId: string
  amount: number
}

export interface BillTableData {
  groupName: string
  paymentBank?: string
  paymentAccount?: string
  paymentQR?: string
  isPrivate?: boolean
  members: Member[]
  items: Item[]
  donations: Donation[]
  participation: Record<string, Record<string, boolean>>
  paymentStatus?: Record<string, boolean>
  userId?: string
}

export const billService = {
  async createBill(name: string, userId?: string) {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: name,
        user_id: userId || null,
        is_private: false
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async saveBill(groupId: string, data: BillTableData, userId?: string) {
    // 1. Upsert group
    const { error: groupError } = await supabase.from('groups').upsert({
      id: groupId,
      name: data.groupName,
      payment_bank: data.paymentBank,
      payment_account: data.paymentAccount,
      payment_qr: data.paymentQR,
      is_private: data.isPrivate ?? false,
      user_id: userId || null,
    })

    if (groupError) throw groupError

    // 2. Clear existing entries to perform a clean sync 
    // (Note: In a production app, we'd handle individual updates to maintain consistency, 
    // but for this MVP, a full sync is simpler and safer given the data structure)
    await supabase.from('participation').delete().eq('group_id', groupId)
    await supabase.from('payment_status').delete().eq('group_id', groupId)
    await supabase.from('donations').delete().eq('group_id', groupId)
    await supabase.from('items').delete().eq('group_id', groupId)
    await supabase.from('members').delete().eq('group_id', groupId)

    // 3. Batch insert members
    const memberIdMap: Record<string, string> = {}
    const { data: insertedMembers, error: membersError } = await supabase
      .from('members')
      .insert(
        data.members.map((m) => ({
          group_id: groupId,
          name: m.name,
        }))
      )
      .select()

    if (membersError) throw membersError

    // Map old UI IDs to new DB IDs for relationships
    data.members.forEach((oldMember, index) => {
      memberIdMap[oldMember.id] = insertedMembers[index].id
    })

    // 4. Batch insert items
    const itemIdMap: Record<string, string> = {}
    const { data: insertedItems, error: itemsError } = await supabase
      .from('items')
      .insert(
        data.items.map((i) => ({
          group_id: groupId,
          name: i.name,
          amount: i.amount,
        }))
      )
      .select()

    if (itemsError) throw itemsError

    data.items.forEach((oldItem, index) => {
      itemIdMap[oldItem.id] = insertedItems[index].id
    })

    // 5. Batch insert donations
    if (data.donations.length > 0) {
      const { error: donationsError } = await supabase.from('donations').insert(
        data.donations.map((d) => ({
          group_id: groupId,
          member_id: memberIdMap[d.memberId],
          amount: d.amount,
        }))
      )
      if (donationsError) throw donationsError
    }

    // 6. Batch insert participation
    const participationToInsert = []
    for (const memberId in data.participation) {
      for (const itemId in data.participation[memberId]) {
        participationToInsert.push({
          group_id: groupId,
          member_id: memberIdMap[memberId],
          item_id: itemIdMap[itemId],
          is_participating: data.participation[memberId][itemId],
        })
      }
    }

    if (participationToInsert.length > 0) {
      const { error: partError } = await supabase
        .from('participation')
        .insert(participationToInsert)
      if (partError) throw partError
    }

    // 7. Batch insert payment status
    if (data.paymentStatus) {
      const paymentStatusToInsert = []
      for (const memberId in data.paymentStatus) {
        paymentStatusToInsert.push({
          group_id: groupId,
          member_id: memberIdMap[memberId],
          has_paid: data.paymentStatus[memberId],
        })
      }

      if (paymentStatusToInsert.length > 0) {
        const { error: statusError } = await supabase
          .from('payment_status')
          .insert(paymentStatusToInsert)
        if (statusError) throw statusError
      }
    }

    return true
  },

  async getBill(groupId: string): Promise<BillTableData | null> {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError || !group) return null

    const [
      { data: members },
      { data: items },
      { data: donations },
      { data: participation },
      { data: paymentStatus },
    ] = await Promise.all([
      supabase.from('members').select('*').eq('group_id', groupId),
      supabase.from('items').select('*').eq('group_id', groupId),
      supabase.from('donations').select('*').eq('group_id', groupId),
      supabase.from('participation').select('*').eq('group_id', groupId),
      supabase.from('payment_status').select('*').eq('group_id', groupId),
    ])

    // Reconstruct participation map
    const participationMap: Record<string, Record<string, boolean>> = {}
    participation?.forEach((p) => {
      if (!participationMap[p.member_id]) participationMap[p.member_id] = {}
      participationMap[p.member_id][p.item_id] = p.is_participating
    })

    // Reconstruct payment status map
    const paymentStatusMap: Record<string, boolean> = {}
    paymentStatus?.forEach((ps) => {
      paymentStatusMap[ps.member_id] = ps.has_paid
    })

    return {
      groupName: group.name,
      paymentBank: group.payment_bank,
      paymentAccount: group.payment_account,
      paymentQR: group.payment_qr,
      isPrivate: group.is_private ?? false,
      members: members || [],
      items: items || [],
      donations: donations?.map((d) => ({
        id: d.id,
        memberId: d.member_id,
        amount: d.amount,
      })) || [],
      participation: participationMap,
      paymentStatus: paymentStatusMap,
      userId: group.user_id,
    }
  },

  async getUserBills(userId: string) {
    const { data: groups, error } = await supabase
      .from('groups')
      .select('id, name, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }
    return groups
  },

  async deleteBill(groupId: string) {
    
    // Explicitly delete related records first to handle potential lack of ON DELETE CASCADE
    await Promise.all([
      supabase.from('participation').delete().eq('group_id', groupId),
      supabase.from('payment_status').delete().eq('group_id', groupId),
      supabase.from('donations').delete().eq('group_id', groupId),
      supabase.from('items').delete().eq('group_id', groupId),
      supabase.from('members').delete().eq('group_id', groupId),
    ]);

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
    
    return true;
  },

  async uploadQR(groupId: string, file: Blob) {
    const fileName = `${groupId}/qr-${Date.now()}.jpg`;
    
    // 1. Get signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bill-assets')
      .createSignedUploadUrl(fileName);

    if (uploadError) {
      throw uploadError;
    }

    // 2. Upload using the signed URL (standard PUT request)
    const response = await fetch(uploadData.signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const { data } = supabase.storage
      .from('bill-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },
}
