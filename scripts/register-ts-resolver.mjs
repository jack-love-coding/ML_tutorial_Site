import { registerHooks } from 'node:module'

// Existing runtime modules use Vite's extensionless TypeScript imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})
