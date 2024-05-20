const checkPaginationFields = (pageOffset, pageNumber) =>  {
  if (!pageOffset && !pageNumber) return

  const isPageNumberInvalid = pageNumber && isNaN(pageNumber)
  const isPageOffsetInvalid = pageOffset && isNaN(pageOffset)
  if (isPageNumberInvalid || isPageOffsetInvalid) {
    throw new Error(`Fields 'page_offset' And 'page_number' should be Number!!`)
  } 
  
  const isPageNumberNegative = !isPageNumberInvalid && pageNumber <= 0 
  const isPageOffsetNegative = !isPageOffsetInvalid && pageOffset <= 0
  if (isPageNumberNegative || isPageOffsetNegative) {
    throw new Error(`Fields 'page_offset' And 'page_number' should be whole Number!!`)
  }
}

export default checkPaginationFields