const SUBMODULE_PATH = 'src/submodules/ameliance-telegram-scripts-deno';
const DENO_JSON_PATH = './deno.json';

console.log('🔄 Updating submodule hash in deno.json...');

const command = new Deno.Command('git', {
   args: ['submodule', 'status', SUBMODULE_PATH],
});

const { code, stdout, stderr } = await command.output();

if (code !== 0) {
   const errorText = new TextDecoder().decode(stderr);
   console.error(`❌ Git execution error: ${errorText}`);
   Deno.exit(1);
}

const statusOutput = new TextDecoder().decode(stdout);
const hashMatch = statusOutput.match(/^[ +-]?([a-f0-9]+)/);

// Явна перевірка з блоком else задовольняє суворий TypeScript
if (!hashMatch || !hashMatch[1]) {
   console.error(
      '❌ Failed to extract hash from submodule status. Check if the submodule is initialized.',
   );
   Deno.exit(1);
} else {
   const currentHash = hashMatch[1];
   console.log(`✅ Found active submodule hash: ${currentHash}`);

   const denoJsonContent = await Deno.readTextFile(DENO_JSON_PATH);

   const urlRegex =
      /(https:\/\/raw\.githubusercontent\.com\/AmelianceSkyMusic\/ameliance-telegram-scripts-deno\/)[^\/"]+(\/)?/g;
   const updatedContent = denoJsonContent.replace(urlRegex, `$1${currentHash}/`);

   if (denoJsonContent === updatedContent) {
      console.log('✨ deno.json already has the latest hash. No changes needed.');
   } else {
      await Deno.writeTextFile(DENO_JSON_PATH, updatedContent);
      console.log('🚀 deno.json successfully updated with the new hash!');
   }
}

export {};
