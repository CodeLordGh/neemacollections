import axios from 'axios';
import { Buffer } from 'buffer';
import moment from 'moment';
import dotenv from 'dotenv';

dotenv.config();

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const authUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const getOAuthToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  try {
    const response = await axios.get(authUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      },
      params: {
        grant_type: 'client_credentials'
      }
    });
    const { access_token } = response.data;
    return access_token;
  } catch (error: any) {
    console.error('Error getting OAuth token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const mpesaStkPush = async (amount: number, access_token: string) => {
  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  let timestamp = moment().format("YYYYMMDDHHmmss");
  const Password  = Buffer.from("174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp).toString('base64');
  const headers = {
    'Authorization': `Bearer ${access_token}`
  };
  if (!access_token) {
    throw new Error('No access token found');
  }

  const options = {
    url,
    headers,
    method: 'POST',
    data: {
      BusinessShortCode: '174379',
      Password: Password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount.toString(),
      PartyA: '254708374149',
      PartyB: '174379',
      PhoneNumber: '254708374149',
      CallBackURL: 'https://example.com/api/callback',
      AccountReference: 'Test',
      TransactionDesc: 'Payment for Order'
    }
  };
  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default getOAuthToken;
