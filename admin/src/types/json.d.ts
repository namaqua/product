// Add this to your tsconfig.json if needed to resolve JSON module imports
declare module "*.json" {
  const value: any;
  export default value;
}
