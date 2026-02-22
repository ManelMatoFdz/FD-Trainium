import { appFetch, fetchConfig } from "./appFetch";

const toResponse = (executor) =>
  new Promise((resolve) =>
    executor(
      (payload) => resolve({ ok: true, payload }),
      (errors) => resolve({ ok: false, payload: errors })
    )
  );


export const findAll = () =>
  toResponse((onSuccess, onErrors) =>
    appFetch(
      `/categories`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    )
  );
