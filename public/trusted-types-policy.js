(() => {
  const trustedTypesApi = window.trustedTypes;

  if (!trustedTypesApi) {
    return;
  }

  trustedTypesApi.createPolicy('default', {
    createHTML: (value) => value,
    createScript: (value) => value,
    createScriptURL: (value) => value,
  });
})();
