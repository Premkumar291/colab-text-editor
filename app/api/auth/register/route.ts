import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserModel from "@/models/User"
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth-utils"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const id = uuidv4()
    const color = `#${Math.floor(Math.random()*16777215).toString(16)}`

    const user = await UserModel.create({
      id,
      name,
      email,
      password: hashedPassword,
      color,
    })

    const token = signToken({ id: user.id, email: user.email, name: user.name })
    
    // Store token in database
    user.token = token
    await user.save()

    await setAuthCookie(token)

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, color: user.color }
    }, { status: 201 })
    
  } catch (err: any) {
    console.error("Register Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
