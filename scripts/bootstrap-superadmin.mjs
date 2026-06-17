import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("export ")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUPERADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.trim();
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD?.trim();
const SUPERADMIN_NAME = process.env.NEXT_PUBLIC_SUPERADMIN_NAME?.trim() || "BatAgents Ops";
const SUPERADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SUPERADMIN_WALLET_ADDRESS?.trim() || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
  console.error("Missing NEXT_PUBLIC_SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function upsertSuperadminAuthUser() {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw listError;
  }

  const existingUser = usersData.users.find((user) => user.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: SUPERADMIN_NAME,
        role: "superadmin",
        wallet_address: SUPERADMIN_WALLET_ADDRESS,
      },
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password: SUPERADMIN_PASSWORD,
    user_metadata: {
      ...existingUser.user_metadata,
      full_name: SUPERADMIN_NAME,
      role: "superadmin",
      wallet_address: SUPERADMIN_WALLET_ADDRESS,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function upsertSuperadminProfile(user) {
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: SUPERADMIN_EMAIL,
    display_name: SUPERADMIN_NAME,
    wallet_address: SUPERADMIN_WALLET_ADDRESS || null,
    role: "superadmin",
  });

  if (error) {
    throw error;
  }
}

async function main() {
  const user = await upsertSuperadminAuthUser();
  await upsertSuperadminProfile(user);

  console.log(`Superadmin account is ready for ${SUPERADMIN_EMAIL}.`);
}

main().catch((error) => {
  console.error("Unable to bootstrap superadmin account.");
  console.error(error);
  process.exit(1);
});
