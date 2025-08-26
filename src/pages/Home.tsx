import { Link, Outlet } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8 mt-4 text-center">Home Panel</h1>

      <div className="xl:px-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          <div className="rounded-md bg-gray-50 shadow-sm sm:mx-2 flex flex-col items-center justify-center text-center">
            <Link
              to={"/clients"}
              className="flex flex-col items-center justify-center w-full h-full py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="w-16 h-16"
              >
                <path
                  fill="#000000"
                  d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z"
                />
              </svg>
              <p className="text-xl font-medium text-slate-700 mt-3">Клиенты</p>
            </Link>
          </div>
          <div className="rounded-md bg-gray-50 shadow-sm sm:mx-2 flex flex-col items-center justify-center text-center">
            <Link
              to={"/chart-of-accounts"}
              className="flex flex-col items-center justify-center w-full h-full py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="w-16 h-16"
              >
                <path
                  fill="#000000"
                  d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 234.5C512 217.5 505.3 201.2 493.3 189.2L386.7 82.7C374.7 70.7 358.5 64 341.5 64L192 64zM453.5 240L360 240C346.7 240 336 229.3 336 216L336 122.5L453.5 240zM192 448L192 384C192 366.3 206.3 352 224 352L416 352C433.7 352 448 366.3 448 384L448 448C448 465.7 433.7 480 416 480L224 480C206.3 480 192 465.7 192 448zM216 128L264 128C277.3 128 288 138.7 288 152C288 165.3 277.3 176 264 176L216 176C202.7 176 192 165.3 192 152C192 138.7 202.7 128 216 128zM216 224L264 224C277.3 224 288 234.7 288 248C288 261.3 277.3 272 264 272L216 272C202.7 272 192 261.3 192 248C192 234.7 202.7 224 216 224z"
                />
              </svg>
              <p className="text-xl font-medium text-slate-700 mt-3">
                План счетов
              </p>
            </Link>
          </div>
          <div className="rounded-md bg-gray-50 shadow-sm sm:mx-2 flex flex-col items-center justify-center text-center">
            <Link
              to={"/accounting-transaction"}
              className="flex flex-col items-center justify-center w-full h-full py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="w-16 h-16"
              >
                <path
                  fill="#000000"
                  d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM192 152C192 165.3 202.7 176 216 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L216 128C202.7 128 192 138.7 192 152zM192 248C192 261.3 202.7 272 216 272L264 272C277.3 272 288 261.3 288 248C288 234.7 277.3 224 264 224L216 224C202.7 224 192 234.7 192 248zM304 324L304 328C275.2 328.3 252 351.7 252 380.5C252 406.2 270.5 428.1 295.9 432.3L337.6 439.3C343.6 440.3 348 445.5 348 451.6C348 458.5 342.4 464.1 335.5 464.1L280 464C269 464 260 473 260 484C260 495 269 504 280 504L304 504L304 508C304 519 313 528 324 528C335 528 344 519 344 508L344 503.3C369 499.2 388 477.6 388 451.5C388 425.8 369.5 403.9 344.1 399.7L302.4 392.7C296.4 391.7 292 386.5 292 380.4C292 373.5 297.6 367.9 304.5 367.9L352 367.9C363 367.9 372 358.9 372 347.9C372 336.9 363 327.9 352 327.9L344 327.9L344 323.9C344 312.9 335 303.9 324 303.9C313 303.9 304 312.9 304 323.9z"
                />
              </svg>
              <p className="text-xl font-medium text-slate-700 mt-3">
                Бухгалтерская операция
              </p>
            </Link>
          </div>
          <div className="rounded-md bg-gray-50 shadow-sm sm:mx-2 flex flex-col items-center justify-center text-center">
            <Link
              to={"/incoming-payment"}
              className="flex flex-col items-center justify-center w-full h-full py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="w-16 h-16"
              >
                <path
                  fill="#000000"
                  d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z"
                />
              </svg>
              <p className="text-xl font-medium text-slate-700 mt-3">
                Bходящий платеж
              </p>
            </Link>
          </div>
          <div className="rounded-md bg-gray-50 shadow-sm sm:mx-2 flex flex-col items-center justify-center text-center">
            <Link
              to={"/outgoing-payment"}
              className="flex flex-col items-center justify-center w-full h-full py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="w-16 h-16"
              >
                <path
                  fill="#000000"
                  d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z"
                />
              </svg>
              <p className="text-xl font-medium text-slate-700 mt-3">
                Исходящий платеж
              </p>
            </Link>
          </div>
          <div className="rounded-md bg-gray-50 shadow-sm sm:mx-2 flex flex-col items-center justify-center text-center">
            <Link
              to={"/clients"}
              className="flex flex-col items-center justify-center w-full h-full py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="w-16 h-16"
              >
                <path
                  fill="#000000"
                  d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z"
                />
              </svg>
              <p className="text-xl font-medium text-slate-700 mt-3">Клиенты</p>
            </Link>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
