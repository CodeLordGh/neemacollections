import getOAuthToken from '../utils/mpesaAuth';
import { mpesaStkPush } from '../utils/mpesaAuth';

const testPayment = async () => {
  try {
    const accessToken = await getOAuthToken();
    const response = await mpesaStkPush(100, accessToken); // Test with a sample amount
    console.log('Payment Response:', response);
  } catch (error) {
    console.error('Payment Error:', error);
  }
};

testPayment(); 