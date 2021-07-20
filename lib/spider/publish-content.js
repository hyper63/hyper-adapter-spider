import { sha256, jwtCreate } from '../../deps.js'

export default function (
  { url, body, sub, aud, secret },
) {
  // TODO: refactor this into a pipeline flow using an Either
  // there are alot of dragons here:
  // new File could throw
  // new FormData could throw
  // sha256 could throw
  // jwtCreate could throw
  // ---
  // we should wrap all of these in an Either TryCatch in a ADT pipeline
  // with the fetch promise returning as the result
  
  const hash = sha256(body, 'utf-8', 'hex')
  const file = new File(body, `${hash}.html`)
  const data = new FormData()
  data.append('file', file)

  const token = jwtCreate({alg: 'HS256', typ: 'JWT'}, { sub, aud }, secret);
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
  }).then((res) => res.json());

}
