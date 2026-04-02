import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserModel from "@/models/User"
import { getAuthToken, removeAuthCookie, verifyToken } from "@/lib/auth-utils"

export async function POST() {
  try {
    const token = await getAuthToken()
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        await connectToDatabase()
        await UserModel.findOneAndUpdate(
          { id: decoded.id },
          { $unset: { token: "" } }
        )
      }
    }
    
    await removeAuthCookie()
    return NextResponse.json({ message: "Logged out" }, { status: 200 })
  } catch (err: any) {
    console.error("Logout Error:", err)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
