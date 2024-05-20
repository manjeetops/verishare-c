import fs from 'fs';
import path from 'path'

const TIME_STAMP = new Date().getTime();

export async function documentTestData (frozen) {
  const data = fs.createReadStream(path.resolve(__dirname, './semester.zip'))
  const formData = {
    document: {
      value: data,
      options: {
        contentType: 'application/zip'
      }
    },
    name: `test-document-${TIME_STAMP}`,
    description: 'document',
    url: 'https://deqode.com',
    frozen
  }
  return formData
}

export async function versionUpdateTestData () {
  const data = fs.createReadStream(path.resolve(__dirname, './documentation.zip'))
  const formData = {
    document: {
      value: data,
      options: {
        contentType: 'application/zip'
      }
    }
  }
  return formData
}

export const UPDATE_DOCUMENT_TEST_DATA = {
  'name': 'updatedDocument',
  'description': 'updatedDocumentDescription',
  'url': 'https://deqode.com/'
}