import { IImageData } from "../interfaces"

export async function imageUploader(images:File[]): Promise<IImageData[]> {
  let imgArr:IImageData[] = []
  const formData = new FormData()

  for (let image of images) {
    formData.append('file', image)
    formData.append('upload_preset', process.env.CLOUD_UPDATE_PRESET)
    formData.append('cload_name', process.env.CLOUD_NAME)

    const data = await fetch(process.env.CLOUD_API, {
      method: 'POST',
      body: formData
    })

    const { public_id, secure_url }:IImageData = await data.json()

    imgArr.push({ public_id, secure_url })
  }

  return imgArr
}
