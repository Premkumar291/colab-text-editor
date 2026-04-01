import { Server } from "@hocuspocus/server"
import dotenv from "dotenv"

dotenv.config()

const server = new Server({
  port: parseInt(process.env.PORT || "1234"),
  async onConnect() {
    console.log("New connection to collaboration microservice...")
  },
  async onAuthenticate(data: any) {
    console.log(`Authenticating room: ${data.documentName}`)
    // For now, allow all connections, but in production, verify JWT
    return {
      user: { id: 1, name: "Anonymous" },
    }
  },
})

server.listen()
console.log(`Hocuspocus Collaboration Microservice is running on port ${process.env.PORT || 1234}`)
