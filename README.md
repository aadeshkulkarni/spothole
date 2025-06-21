# Pothole Portal

[![Live Demo](https://img.shields.io/badge/Live%20Demo-spothole.vercel.app-blue?style=for-the-badge&logo=vercel)](https://spothole.vercel.app/)

A transparent and collaborative platform that connects citizens and government authorities to efficiently identify and resolve public infrastructure issues like potholes, fostering civic engagement and improving road safety across India.

## ✨ Features

- 📍 **Map-based Reporting:** See all reported potholes on an interactive map.
- 🔐 **Easy Sign-in:** Authenticate using your Google account to report issues.
- 📸 **Simple Reporting:** Upload a photo, and we'll automatically detect the location.
- 📈 **Track Status:** View the status of any report (`Reported`, `Work in Progress`, `Resolved`).
- 🇮🇳 **Multi-lingual:** Built to support multiple Indian languages (coming soon!).

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Mapping:** [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **File Storage:** [AWS S3](https://aws.amazon.com/s3/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)

## 🛠️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20.x or higher recommended)
- [npm](https://www.npmjs.com/)
- A MongoDB database instance.
- AWS S3 bucket and credentials.
- Google OAuth credentials.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/pothole-portal.git
    cd spothole
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` in the root of the project and add the following environment variables.

    ```bash
    # MongoDB - Connection string for your MongoDB database
    MONGODB_URI=

    # NextAuth.js - For authentication
    # You can generate a secret with `openssl rand -base64 32` in your terminal
    NEXTAUTH_SECRET=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=

    # AWS S3 - For file storage
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_S3_REGION=
    AWS_S3_BUCKET_NAME=

    # These are exposed to the client-side for displaying S3 images
    # The values should be the same as the AWS_S3_REGION and AWS_S3_BUCKET_NAME above
    NEXT_PUBLIC_S3_REGION=
    NEXT_PUBLIC_S3_BUCKET_NAME=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 How to Contribute

We welcome contributions from the community! To contribute:

1.  **Fork the repository** on GitHub.
2.  **Create a new branch:** `git checkout -b feature/your-feature-name`
3.  **Make your changes** and commit them with a clear message.
4.  **Push to your branch:** `git push origin feature/your-feature-name`
5.  **Create a Pull Request** against the `main` branch of this repository.

Please make sure your code adheres to the existing style and that you run the linter before submitting a pull request.

```bash
npm run lint
```

### Code Style & Formatting

This project uses [Prettier](https://prettier.io/) for automated code formatting. A pre-commit hook is set up using [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) that will automatically format your staged files before you commit.

This ensures a consistent code style across the entire codebase. You don't need to do anything manually, but you can run the formatter at any time with:

```bash
npm run format
```

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

Built with ❤️ for a better India.
