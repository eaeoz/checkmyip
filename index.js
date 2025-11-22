#!/usr/bin/env node

const TIMEOUT_MS = 10000; // 10 second timeout

// Create an AbortController for timeout handling
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

fetch('https://ipinfo.io/json', { signal: controller.signal })
  .then(response => {
    clearTimeout(timeoutId);
    
    // Check if response is ok (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format. Expected JSON.');
    }
    
    return response.json();
  })
  .then(data => {
    // Validate response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response data received.');
    }
    
    // Check if IP field exists
    if (!data.ip) {
      throw new Error('IP address not found in response.');
    }
    
    // Output the IP address
    console.log(data.ip);
  })
  .catch(error => {
    clearTimeout(timeoutId);
    
    // Handle different error types with user-friendly messages
    if (error.name === 'AbortError') {
      console.error('Error: Request timed out. Please check your internet connection.');
      process.exit(1);
    } else if (error.message.includes('fetch failed') || error.code === 'ENOTFOUND') {
      console.error('Error: Network connection failed. Please check your internet connection.');
      process.exit(1);
    } else if (error.message.includes('HTTP error')) {
      console.error(`Error: ${error.message}`);
      console.error('The IP service may be temporarily unavailable. Please try again later.');
      process.exit(1);
    } else if (error.message.includes('Invalid response')) {
      console.error(`Error: ${error.message}`);
      console.error('Please try again later.');
      process.exit(1);
    } else if (error.message.includes('IP address not found')) {
      console.error('Error: Could not retrieve IP address from the service.');
      process.exit(1);
    } else {
      // Generic error handler
      console.error(`Error: ${error.message || 'An unexpected error occurred.'}`);
      process.exit(1);
    }
  });
