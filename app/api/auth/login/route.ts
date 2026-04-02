import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserModel from "@/models/User"
import { comparePasswords, setAuthCookie, signToken } from "@/lib/auth-utils"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name })
    
    // Store token in database
    user.token = token
    await user.save()

    await setAuthCookie(token)

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, color: user.color }
    }, { status: 200 })

  } catch (err: any) {
    console.error("Login Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
