import { attachToken } from "./jwtlib"

const socket = attachToken()
// const socket = io("http://localhost:3000", {
//   extraHeaders: {
//     Authorization:
//       "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMmUzMGVlMS1mNGQ3LTQ3NTYtYjYzNC0zNzc4ODA4NWNmODciLCJpYXQiOjE3ODYxODQyMzI3NDYsImV4cCI6MTc4NjE4NDMxOTE0Nn0.Y1ittDXd2b5MkbywW496_hCBTh0FyyySm_66YrYQBvESDMMcVR6Ehyca56ETnDxRCBujkdR0ki5Qj2zXLvrgblr_gRa-6IR199hr-GX0Etj29gzGnDjdmSUeN6n3WdwAkacNFE8wITd3X9fdZK4GKUGgiBBZ12PnAE1mJDDn60Y5ksY6gRTfKT09IzX-QidkmrSbomq1d3uwSQE6XjneCUNuZedvK6WxzJo9U_2GjP5F9eApF4hcNnmo9sUXARIFK-W1LoF9H3WtG4ubmksgCGtVR2IAtpzzJKUjRG-7XopWlhbXvuIKkUa5vsBEn4-2xM4y0RIRb9qynxzXpRCFFg",
//   },
// })

export default socket
