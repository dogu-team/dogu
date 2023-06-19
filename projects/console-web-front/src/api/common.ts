import api from '.';

export const sendFeedback = async (text: string) => {
  return await api.post<void>('/feedback', { feedback: text });
};

export const sendContactUsForm = async (firstName: string, lastName: string, email: string, organization: string, message: string) => {
  const { data } = await api.post<boolean>('/contact', {
    firstName,
    lastName,
    email,
    organization,
    message,
  });

  return data;
};
