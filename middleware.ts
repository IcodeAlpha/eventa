import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const eventsProtected = createRouteMatcher(["/events(.*)"])
const webhookProtected = createRouteMatcher(["/api/webhook(.*)"])

// export default clerkMiddleware({
//     publicRoutes: [
//         '/',
//         '/events/id',
//         '/api/webhook/clerk',
//         '/api/webhook/stripe',
//         '/api/uploadthing'
//     ],
//     ignoredRoutes: [
//         '/api/webhook/clerk',
//         '/api/webhook/stripe',
//         '/api/uploadthing'
//     ]
// });

export default clerkMiddleware((auth, request) => {
    if (eventsProtected(request)) auth().protect()
  })

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};