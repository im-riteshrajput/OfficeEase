import { useState } from "react";

function CustomField({ fieldTitle, fieldDesc, fieldType, maxlen,  onChange }) {
  return (
    <>
      <div className="card-name w-full">
        <h1 className="my-2 font-semibold">{fieldTitle}</h1>
        <input type={fieldType} maxLength={maxlen} placeholder={fieldDesc} onChange={onChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500" />
      </div>
    </>
  );
}

// function CustomField({ fieldTitle, fieldType, fieldDesc, onChange, maxlen }) {
//   return (
//     <div className="card-name w-full">

//       <label className="my-2 font-semibold">
//         {fieldTitle}
//       </label>

//       <input
//         type={fieldType}
//         placeholder={fieldDesc}
//         maxLength={maxlen}
//         onChange={onChange}
//         className="border p-2 rounded-md"
//       />

//     </div>
//   );
// }

// function CustomSelectCard({ fieldTitle, value, mapValue,  onChange }) {
//   // const [role, setrole] = useState("Employee");

//   let maap = mapValue;
//   return (
//     <>
//       <div className="card-name w-full h-auto">
//         <h1 className="my-2 font-semibold">{fieldTitle}</h1>
//         <div className="h-10">
//           <select name="1"
//             className="w-full h-full bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
//             value={role}
//             onChange={onChange}
//           >
//             {maap.map((d) => (
//               <option key={d} value={d}>{d}</option>
//             ))}
//           </select>
//         </div>
//       </div>
//     </>
//   );
// }

function CustomSelectCard({ fieldTitle, value, mapValue, onChange }) {

  return (
    <div className="card-name w-full h-auto">
      <h1 className="my-2 font-semibold">{fieldTitle}</h1>

      <div className="h-10">
        <select
          className="w-full h-full bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
          value={value}
          onChange={onChange}
        >
          {mapValue.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CustomSubmitBtn({ fieldTitle, fieldDesc, fieldType }) {
  return (
    <>
      <div className="card-name">

      </div>
    </>
  );
}



export { CustomField, CustomSelectCard, CustomSubmitBtn };