import { NextRequest, NextResponse } from "next/server"
import { getAuthToken, verifyToken, removeAuthCookie } from "@/lib/auth-utils"
import connectToDatabase from "@/lib/db"
import UserModel from "@/models/User"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) {
      // Don't call removeAuthCookie here as it's a GET request and might be called in SSR
      return NextResponse.json({ user: null }, { status: 401 })
    }

    await connectToDatabase()
    const user = await UserModel.findOne({ id: decoded.id }).select("-password")
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (err: any) {
    console.error("Auth Me Error:", err)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
