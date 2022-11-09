const baseUrl:string = process.env.BASE_URL

export const getData = async <T>(url: string, token?: string): Promise<T> => {
  const res = await fetch(`${baseUrl}/api/${url}`, {
    method: 'GET',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  })

  const data:T = await res.json()
  return data
}


export const postData = async <T, K>(url: string, form: T, token?: string): Promise<K> => {
  const res = await fetch(`${baseUrl}/api/${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(form)
  })

  const data:K = await res.json()
  return data
}


export const putData = async <T, K>(url: string, form: T, token: string): Promise<K> => {
  const res = await fetch(`${baseUrl}/api/${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(form)
  })

  const data:K = await res.json()
  return data
}


export const patchData = async <T, K>(url: string, form: T, token: string): Promise<K> => {
  const res = await fetch(`${baseUrl}/api/${url}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(form)
  })

  const data:K = await res.json()
  return data
}


export const deleteData = async <T>(url: string, token: string): Promise<T> => {
  const res = await fetch(`${baseUrl}/api/${url}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token
    }
  })

  const data:T = await res.json()
  return data
}
