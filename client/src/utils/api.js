/**
 * Safely handles fetch responses by validating the Content-Type header.
 * If the response is successful, it returns the parsed JSON.
 * If the response fails, it parses the error message and throws it.
 * This prevents parsing crashes like "Unexpected end of JSON input".
 */
export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    const errorMessage = text && text.length < 100 
      ? text 
      : `HTTP Error ${response.status}: Server offline or proxy error`;
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};
