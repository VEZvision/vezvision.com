(() => {
  const trustedTypesApi = window.trustedTypes;

  if (!trustedTypesApi) {
    return;
  }

  // Strict default policy: block all sink writes that don't go through
  // a named policy (dompurify, react-helmet). This prevents arbitrary
  // innerHTML/script injection even if an attacker bypasses DOMPurify.
  trustedTypesApi.createPolicy("default", {
    createHTML: (_value, sink) => {
      if (sink && String(sink).includes("HTML")) {
        console.warn("[TT] Blocked unsanitized HTML sink write");
        return "";
      }
      return _value;
    },
    createScript: () => {
      console.warn("[TT] Blocked dynamic script creation");
      return "";
    },
    createScriptURL: () => {
      console.warn("[TT] Blocked dynamic script URL creation");
      return "";
    },
  });
})();
