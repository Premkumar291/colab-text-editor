import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserModel from "@/models/User"
import { getAuthToken, verifyToken } from "@/lib/auth-utils"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const user = await UserModel.findOne({ email }).select("id name email avatar color")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
