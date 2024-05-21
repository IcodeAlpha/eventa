import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Ensure WEBHOOK_SECRET is set
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'WEBHOOK_SECRET is not set' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  const { id } = evt.data;
  if(!id){
    return NextResponse.json("No event Id")
  }

  switch (eventType) {
    case 'user.created':
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;

      const newUser = await createUser({
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name || '',
        lastName: last_name || '',
        photo: image_url,
      });

      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: 'OK', user: newUser });

    case 'user.updated':
      const updatedUser = await updateUser(id, {
        firstName: evt.data.first_name || '',
        lastName: evt.data.last_name || '',
        username: evt.data.username || '',
        photo: evt.data.image_url || '',
      });

      return NextResponse.json({ message: 'OK', user: updatedUser });

    case 'user.deleted':
      const deletedUser = await deleteUser(id);

      return NextResponse.json({ message: 'OK', user: deletedUser });

    default:
      console.log('Unhandled event type:', eventType);
      return NextResponse.json({ message: 'Unhandled event type' }, { status: 400 });
  }
}
