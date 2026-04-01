import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserModel from "@/models/User"

export async function GET() {
  try {
    await connectToDatabase()

    // Fetch users active in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    let users = await UserModel.find({ lastSeen: { $gt: twoMinutesAgo } }).sort({ name: 1 })

    // If no active users, seed some for demonstration (since it's a dev environment)
    if (users.length === 0) {
      const seedUsers = [
        { id: "seed-1", name: "John Doe (DB)", status: "online", color: "#3B82F6", lastSeen: new Date() },
        { id: "seed-2", name: "Alice Smith (DB)", avatar: "https://github.com/shadcn.png", status: "online", color: "#EC4899", lastSeen: new Date() },
        { id: "seed-3", name: "Bob Wilson (DB)", status: "away", color: "#10B981", lastSeen: new Date() },
      ]
      
      // Upsert these so they exist in DB
      for (const user of seedUsers) {
        await UserModel.findOneAndUpdate({ id: user.id }, { $set: user }, { upsert: true })
      }
      
      users = await UserModel.find({ lastSeen: { $gt: twoMinutesAgo } }).sort({ name: 1 })
    }

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("GET Users Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST to update presence/lastSeen (simulated for now)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { id, name, color } = await request.json()

    const user = await UserModel.findOneAndUpdate(
      { id },
      { $set: { name, color, lastSeen: new Date(), status: "online" } },
      { upsert: true, new: true }
    )

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("POST User Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
