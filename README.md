# StoreIt - Your Personal Document Manager 🏢✨

Welcome to **StoreIt** — a powerful, easy-to-use web application that allows you to upload, share, and manage your documents seamlessly. Whether you're looking for something similar to Google Drive or Dropbox, StoreIt has you covered! ✉️⬇️

![StoreIt Dashboard](https://github.com/user-attachments/assets/3e294dae-9da7-4eed-86cb-7bb7601fc512)

## 🚀 Features
- **Upload Documents**: Add any type of document to your personal storage space.
- **Share Files**: Share documents with other users via email. 📤
- **Real-time Search**: Quickly find any file with the integrated search bar. 🔍
- **Secure Login**: Authenticate users through OTP for added security. ⚡️
- **User-friendly UI**: A clean, intuitive interface built with **Tailwind CSS**.

## 🛠️ Tech Stack
- **Framework**: Next.js ✨
- **Language**: TypeScript 🛠️
- **Styling**: Tailwind CSS ✨
- **Backend**: Appwrite for backend services and authentication 🗑️

## ℹ️ How to Install and Run Locally
Follow these steps to set up StoreIt on your local machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/storeit.git
   cd storeit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Appwrite**:
   - Ensure you have Appwrite set up on your local server.
   - Update your environment variables in `.env.local`:
     ```env
     NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"  
     NEXT_PUBLIC_APPWRITE_PROJECT="<Your Appwrite Project ID>"  
     NEXT_PUBLIC_APPWRITE_DATABASE="<Your Appwrite Database Name>"  
     NEXT_PUBLIC_APPWRITE_USERS_COLLECTION="<Your Appwrite Users Collection>"  
     NEXT_PUBLIC_APPWRITE_FILES_COLLECTION="<Your Appwrite Files Collection>"  
     NEXT_PUBLIC_APPWRITE_BUCKET="<Your Appwrite Bucket>"  
     NEXT_APPWRITE_KEY="<Your Appwrite API Key>"

     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access StoreIt**:
   Navigate to [http://localhost:3000](http://localhost:3000) and start managing your documents! 📝⬇️

## 💡 Usage
1. **Sign Up and Login**
   - Enter your email and receive an OTP for secure login.
![SignUp Screen](https://github.com/user-attachments/assets/69607580-4e87-4a04-b557-7025e107cce0)
![OTP Screen](https://github.com/user-attachments/assets/ce2228eb-ba20-462e-bfd6-8ba2ff932e37)
![Login Screen](https://github.com/user-attachments/assets/d32d9878-ea1e-4767-b355-1f4a17414c6d)





2. **File Actions**
   - Click on the action icon button and choose the actions.
   ![File Action Document](https://github.com/user-attachments/assets/8dd2f9e1-37f7-496f-85b6-f60502626dc4)


3. **Sharing Files**
   - Share documents by entering the recipient's email address.
   ![Share Document](https://github.com/user-attachments/assets/a28d49c7-e750-4172-9992-41d09c7e49af)


## 🛡️ Security Features
- **OTP Authentication**: Ensures only verified users can access their accounts.
- **Appwrite Integration**: Handles secure session management and data storage.

## 📊 Roadmap
Future updates may include:
- **Collaborative Workspaces** 🔧
- **Advanced File Permissions** 🔒
- **Notifications** for shared files ✉️

## ✨ Contributing
We welcome contributions! Feel free to fork the project and submit pull requests.

## 📍 License
This project is licensed under the MIT License.

---

Thank you for checking out **StoreIt**! Feel free to explore, share, and manage your documents effortlessly. 📄✌️
