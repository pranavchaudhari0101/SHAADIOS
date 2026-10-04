// ShaadiOS WhatsApp Integration Engine
// Provides zero-friction deep-linking to WhatsApp Web / Native Mobile App

export function cleanIndianPhone(phoneStr) {
  if (!phoneStr) return ''
  const digits = phoneStr.replace(/[^0-9]/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  return digits
}

export function openWhatsApp({ phone, message }) {
  const cleanPhone = cleanIndianPhone(phone)
  const encodedText = encodeURIComponent(message)
  let url = ''
  if (cleanPhone) {
    url = `https://wa.me/${cleanPhone}?text=${encodedText}`
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedText}`
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function getTaskWhatsAppMessage(task, wedding) {
  const couple = wedding?.couple || 'Rhea & Arjun'
  const city = wedding?.city || 'Jaipur'
  const date = wedding?.date || '18 Feb 2027'

  return `*ShaadiOS Wedding Update* 💍
_For ${couple}’s Celebration in ${city} (${date})_

Hi ${task.owner || 'there'}! Quick priority reminder:
📌 *${task.title}*
⏳ *Due:* ${task.due || 'Soon'}
🎯 *Why it matters:* ${task.reason || 'Critical for upcoming milestones'}
${task.notes && task.notes.length > 0 ? `\n📝 *Latest note:* ${task.notes[0]}` : ''}

Thank you for helping keep our wedding on track! ✨`
}

export function getVendorWhatsAppMessage(vendor, wedding) {
  const couple = wedding?.couple || 'Rhea & Arjun'
  const city = wedding?.city || 'Jaipur'
  const date = wedding?.date || '18 Feb 2027'
  const contact = vendor.contactPerson || vendor.name

  return `Hello ${contact} Ji, 🙏

Warm greetings from *${couple}*! We are finalizing contracts for our wedding celebration in ${city} on ${date}.

Regarding *${vendor.name}* (${vendor.category}):
${vendor.holdDeadline ? `• Date hold deadline: ${vendor.holdDeadline}\n` : ''}• Next milestone: *${vendor.action}*
• Estimated quote: *${vendor.amount || 'As discussed'}*

Could you please confirm availability and share the formal agreement details so we can process the booking advance?

Looking forward to working together!
Warm regards,
*${couple}*`
}

export function getCollaboratorInviteWhatsAppMessage(person, wedding) {
  const couple = wedding?.couple || 'Rhea & Arjun'
  const city = wedding?.city || 'Jaipur'
  const date = wedding?.date || '18 Feb 2027'

  return `Namaste ${person.name}! 🙏

${couple} have invited you to join their wedding planning team on *ShaadiOS* for the ${city} celebrations (${date}).

✨ *Your Role:* ${person.role}
📋 *Access:* Private family tasks & timeline milestones

Click here to view your assigned responsibilities and collaborate:
👉 https://shaadios.app/join?team=${encodeURIComponent(couple)}

Let's make this celebration magical together! 🌸`
}

export function getGuestRsvpWhatsAppMessage(guest, wedding) {
  const couple = wedding?.couple || 'Rhea & Arjun'
  const city = wedding?.city || 'Jaipur'
  const date = wedding?.date || '18 Feb 2027'
  const events = (guest.events || ['Wedding']).join(', ')

  return `Namaste ${guest.name}! 🙏 Warmest greetings from *${couple}* & families!

We are delighted to celebrate our wedding in *${city}* on *${date}*. You are invited to join us for:
🎉 *${events}*
👥 *Party Size:* ${guest.partySize || 1} guest(s)

Could you please confirm your attendance and let us know if you have any dietary preferences (Jain / Pure Veg / etc.)?
${guest.stayRequired ? '🏨 *Accommodation:* We are arranging your hotel stay at Royal Palace Suites.' : ''}

Please reply with "Attending" or your details to help us arrange the warmest hospitality for you! 🌸`
}

export function getRoomAllocationWhatsAppMessage(guest, room, wedding) {
  const couple = wedding?.couple || 'Rhea & Arjun'
  const city = wedding?.city || 'Jaipur'

  return `Namaste ${guest.name}! 🌸

Here are your stay details for *${couple}’s Wedding Celebration* in ${city}:
🏨 *Hotel:* Royal Palace Suites
🚪 *Room Number:* ${room?.roomNumber || 'Assigned at check-in'} (${room?.type || 'Deluxe Room'})
📅 *Check-in:* ${room?.checkIn || '17 Feb 2027'} (from 12:00 PM)
📅 *Check-out:* ${room?.checkOut || '19 Feb 2027'} (until 11:00 AM)
📍 *Wing:* ${room?.wing || 'Main Guest Wing'}

Our hospitality desk at the lobby will welcome you with your keys and schedule. For early assistance, contact hospitality lead at +91 98200 77889. Can't wait to celebrate together! ✨`
}

