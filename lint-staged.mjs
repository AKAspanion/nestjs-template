const config = {
  //   '**/*.{ts?(x),mts}': () => 'tsc -p tsconfig.prod.json --noEmit',
  '*.{js,jsx,mjs,cjs,ts,tsx,mts}': ['yarn lint'],
  '*.{md,json}': 'prettier --write',
};

export default config;
