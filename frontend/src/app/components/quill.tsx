import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import React Quill to disable SSR
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });


const modules = {
    toolbar: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': ['arial', 'courier', 'georgia', 'impact', 'tahoma', 'times-new-roman', 'verdana'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header', 'font', 'list',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background', 'align',
    'link', 'image'
];

const Quill = () => {
    const [value, setValue] = useState('');

    return (
        <div>
            <ReactQuill
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
                theme="snow"
            />
        </div>
    );
};

export default Quill;