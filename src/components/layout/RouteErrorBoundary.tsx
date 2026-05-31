import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'Wystąpił nieoczekiwany błąd.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Wystąpił nieznany błąd.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 bg-gray-50 rounded-3xl flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-gray-900" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Ups! Coś poszło nie tak
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Przepraszamy, napotkaliśmy niespodziewany problem.
          <br />
          {import.meta.env.DEV && (
            <span className="text-xs mt-2 block opacity-70 font-mono bg-gray-50 py-1 px-2 rounded inline-block">
              {errorMessage}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Home className="w-5 h-5 mr-2" />
            Strona główna
          </button>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gray-900 hover:bg-black transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Spróbuj ponownie
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
