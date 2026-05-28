/**
 * Install Piston language packages via HTTP API (no ppman CLI required).
 *
 * Usage:
 *   node scripts/install-piston-packages.js
 *   PISTON_URL=http://127.0.0.1:2000/api/v2 node scripts/install-piston-packages.js
 *
 * Requires: Piston container running (docker compose -f docker-compose.piston.yml up -d)
 */

const axios = require("axios");
const { resolvePistonApiBase } = require("./piston-api");

const API_BASE = resolvePistonApiBase(process.env.PISTON_URL);

/** Problem-solving: JS UI uses TypeScript runtime on Piston */
const MICROTRAINER_PACKAGES = [
  { language: "typescript", version: "5.0.3" },
  { language: "python", version: "3.10.0" },
  { language: "java", version: "15.0.2" },
];

async function getRuntimes() {
  const { data } = await axios.get(`${API_BASE}/runtimes`, { timeout: 15000 });
  return data;
}

async function getPackages() {
  const { data } = await axios.get(`${API_BASE}/packages`, { timeout: 60000 });
  return data;
}

function isInstalled(runtimes, language, version) {
  return runtimes.some(
    (r) =>
      r.language === language &&
      (r.version === version || r.version.startsWith(version.split(".")[0]))
  );
}

async function installPackage(language, version) {
  console.log(`\n📦 Installing ${language} ${version} ...`);
  const { data } = await axios.post(
    `${API_BASE}/packages`,
    { language, version },
    { timeout: 600000 }
  );
  console.log(`   ✅ Installed ${data.language} ${data.version}`);
  return data;
}

async function tryInstall(language, version, runtimes) {
  if (isInstalled(runtimes, language, version)) {
    console.log(`⏭️  ${language} already installed`);
    return true;
  }
  try {
    await installPackage(language, version);
    return true;
  } catch (e) {
    const msg = e.response?.data?.message || e.message;
    console.warn(`   ⚠️  Exact version failed: ${msg}`);
  }

  const major = version.split(".")[0];
  try {
    await installPackage(language, `${major}.x`);
    return true;
  } catch (e2) {
    console.error(`   ❌ Failed ${language}:`, e2.response?.data?.message || e2.message);
    return false;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🔧 Piston package installer (MicroTrainer)");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`API base: ${API_BASE}\n`);

  if (/emkc\.org/i.test(API_BASE)) {
    console.error(
      "❌ Cannot install packages on emkc.org public API. Use self-hosted Piston:\n" +
        "   docker compose -f docker-compose.piston.yml up -d\n" +
        "   PISTON_URL=http://127.0.0.1:2000/api/v2 node scripts/install-piston-packages.js"
    );
    process.exit(1);
  }

  let runtimes;
  try {
    runtimes = await getRuntimes();
    console.log(`Current runtimes: ${runtimes.length}`);
  } catch (e) {
    console.error(
      "❌ Cannot reach Piston. Is the container running?\n" +
        "   docker compose -f docker-compose.piston.yml up -d\n" +
        `   curl ${API_BASE}/runtimes`
    );
    console.error(e.message);
    process.exit(1);
  }

  try {
    const catalog = await getPackages();
    const available = catalog.filter((p) => !p.installed).length;
    console.log(`Package catalog entries: ${catalog.length} (${available} not yet installed)`);
  } catch {
    console.log("(Could not fetch full package catalog; continuing with install requests)");
  }

  let ok = 0;
  let fail = 0;
  for (const pkg of MICROTRAINER_PACKAGES) {
    const success = await tryInstall(pkg.language, pkg.version, runtimes);
    if (success) ok++;
    else fail++;
    try {
      runtimes = await getRuntimes();
    } catch {
      /* ignore */
    }
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`Done: ${ok} ok, ${fail} failed`);
  runtimes = await getRuntimes();
  console.log(`\n📋 Installed runtimes (${runtimes.length}):`);
  runtimes.forEach((r) => console.log(`   - ${r.language} ${r.version}`));
  console.log("\nSet backend .env:");
  console.log("   PISTON_URL=http://127.0.0.1:2000/api/v2");
  console.log("\nVerify:");
  console.log(`   curl ${API_BASE}/runtimes`);
  console.log("   node test-piston.js");
  console.log("═══════════════════════════════════════════════════════\n");

  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
