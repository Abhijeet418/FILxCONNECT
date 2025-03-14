export type User = {
  id: string
  username: string
  email: string
  status: "active" | "warned" | "blocked"
  reportCount: number
  createdAt: Date
}

export type Post = {
  id: string
  userId: string
  title: string
  content: string
  status: "0" | "1" | "3"
  createdAt: string
  user: {
    avatar: string
    username: string
    email: string
  }
  mediaUrls: string
}

export type Report = {
  status: string
  reportId: string
  targetType: "user" | "post" | string
  targetId: string
  reporterId: string
  reportedUserId: string
  reporterUserId: string
  reportedPostId: string
  reason: string
  reportStatus: "PENDING" | "WARNING_1" | "WARNING_2" | "WARNING_3" | "BLOCKED" | "DISMISSED"
  createdAt: Date
  reporter: {
    username: string
  }
  target: {
    username?: string
    title?: string
  }
}

