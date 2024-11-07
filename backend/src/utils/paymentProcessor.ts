import getOAuthToken from './mpesaAuth';
import { mpesaStkPush } from './mpesaAuth';

export const testPayment = async () => {
  try {
    const accessToken = await getOAuthToken();
    const response = await mpesaStkPush(100, accessToken); // Test with a sample amount
    console.log('Payment Response:', response);
  } catch (error) {
    console.error('Payment Error:', error);
  }
};

// Call the test function if this file is executed directly
if (require.main === module) {
  testPayment();
} 