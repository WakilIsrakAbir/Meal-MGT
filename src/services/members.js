import "server-only";
import { isValidObjectId } from "mongoose";
import { compare, hash } from "bcryptjs";
import { connectDB } from "@/lib/db";
import { UserError } from "@/lib/errors";
import Member from "@/models/Member";

// Never send passwordHash anywhere: pages only get this shape.
function toMember(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    role: doc.role,
    status: doc.status,
    active: doc.active,
    requestedAt: doc.createdAt?.toISOString() ?? null,
    defaultMeals: {
      lunch: doc.defaultMeals?.lunch ?? 1,
      dinner: doc.defaultMeals?.dinner ?? 1,
    },
  };
}

const EMAIL_TAKEN = "An account with this email already exists.";

function duplicateEmail(error) {
  if (error?.code === 11000) return new UserError(EMAIL_TAKEN);
  return error;
}

// The unique index also guards this, but check first so the message is clear.
async function assertEmailFree(email, exceptId) {
  const filter = exceptId ? { email, _id: { $ne: exceptId } } : { email };
  if (await Member.exists(filter)) throw new UserError(EMAIL_TAKEN);
}

// status: "approved" (default), "pending", "rejected", or null for everyone.
export async function listMembers({ status = "approved" } = {}) {
  await connectDB();
  const docs = await Member.find(status ? { status } : {}).sort({ name: 1 }).lean();
  return docs.map(toMember);
}

export async function countPendingMembers() {
  await connectDB();
  return Member.countDocuments({ status: "pending" });
}

export async function getMemberById(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Member.findById(id).lean();
  return doc ? toMember(doc) : null;
}

// The admin adds someone directly: they can log in straight away.
export async function createMember({ name, email, phone, password, role, defaultMeals }) {
  await connectDB();
  await assertEmailFree(email);
  try {
    await Member.create({
      name,
      email,
      phone,
      role,
      defaultMeals,
      status: "approved",
      passwordHash: await hash(password, 10),
    });
  } catch (error) {
    throw duplicateEmail(error);
  }
}

// Someone asks to join with email + password. They wait for the admin.
export async function registerMember({ name, email, phone, password }) {
  await connectDB();
  const existing = await Member.findOne({ email }).lean();
  if (existing?.status === "pending") throw new UserError("You already sent a request. Please wait for the admin.");
  if (existing) throw new UserError(`${EMAIL_TAKEN} Please log in.`);
  try {
    await Member.create({ name, email, phone, status: "pending", passwordHash: await hash(password, 10) });
  } catch (error) {
    throw duplicateEmail(error);
  }
}

export async function setMemberStatus(id, status) {
  if (!isValidObjectId(id)) throw new UserError("Member not found.");
  await connectDB();
  const result = await Member.updateOne({ _id: id }, { $set: { status, ...(status === "approved" && { active: true }) } });
  if (result.matchedCount === 0) throw new UserError("Member not found.");
}

export async function updateMember(id, { name, email, phone, role, active, defaultMeals, password }) {
  await connectDB();
  const existing = await Member.findById(id).lean();
  if (!existing) throw new UserError("Member not found.");
  await assertEmailFree(email, id);

  const losesAdmin = existing.role === "admin" && existing.active && (role !== "admin" || !active);
  if (losesAdmin) {
    const otherAdmins = await Member.countDocuments({ _id: { $ne: id }, role: "admin", active: true, status: "approved" });
    if (otherAdmins === 0) {
      throw new UserError("There must be at least one active admin. Make someone else admin first.");
    }
  }

  const update = { name, email, phone, role, active, defaultMeals };
  if (password) update.passwordHash = await hash(password, 10);
  try {
    await Member.updateOne({ _id: id }, { $set: update });
  } catch (error) {
    throw duplicateEmail(error);
  }
}

// Returns { member } when login is allowed, otherwise { error } with a message to show.
export async function verifyLogin(email, password) {
  await connectDB();
  const doc = await Member.findOne({ email }).lean();
  if (!doc?.passwordHash || !(await compare(password, doc.passwordHash))) {
    return { error: "Wrong email or password." };
  }
  if (doc.status === "pending") return { error: "Your request is waiting for the admin to accept it." };
  if (doc.status === "rejected") return { error: "Your request was not accepted. Please contact the admin." };
  if (!doc.active) return { error: "Your account is turned off. Please contact the admin." };
  return { member: toMember(doc) };
}

export async function changePassword(id, currentPassword, newPassword) {
  await connectDB();
  const doc = await Member.findById(id).lean();
  if (!doc) throw new UserError("Member not found.");
  if (!(await compare(currentPassword, doc.passwordHash))) {
    throw new UserError("Your current password is wrong.");
  }
  await Member.updateOne({ _id: id }, { $set: { passwordHash: await hash(newPassword, 10) } });
}
