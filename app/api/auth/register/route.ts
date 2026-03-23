/**
 * POST /api/auth/register
 * Creates a new user account.
 *
 * Role logic:
 * - Default role is USER (student)
 * - To register as ADMIN, the request must include the correct `adminCode`
 *   matching the ADMIN_INVITE_CODE environment variable
 *
 * Returns 409 if the email is already taken.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, adminCode } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Determine role — default to USER unless valid admin code is provided
    let assignedRole = "USER";
    if (role === "ADMIN") {
      const validCode = process.env.ADMIN_INVITE_CODE;
      if (!adminCode || adminCode !== validCode) {
        return NextResponse.json({ error: "Invalid admin invite code" }, { status: 403 });
      }
      assignedRole = "ADMIN";
    }

    // Prevent duplicate accounts
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: assignedRole },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
