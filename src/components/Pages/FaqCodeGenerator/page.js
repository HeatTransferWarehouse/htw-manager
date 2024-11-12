import React, { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from "draft-js-export-html";
import "../FaqCodeGenerator/Draft.css";
import { generateHtml } from "./generate-html";
import { CopyBlock, dracula } from "react-code-blocks";

export default function FaqCodeGenerator() {
  const [faqList, setFaqList] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [faqTitle, setFaqTitle] = useState("");

  // Function to add a new FAQ item
  const addFaqItem = () => {
    setFaqList((prevList) => [
      ...prevList,
      { question: "", answer: "", editorState: EditorState.createEmpty() },
    ]);
  };

  const deleteFaqItem = (index) => {
    setFaqList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, value) => {
    const updatedFaqList = [...faqList];
    updatedFaqList[index].question = value;
    setFaqList(updatedFaqList);
  };

  const handleEditorChange = (index, newEditorState) => {
    const updatedFaqList = [...faqList];
    updatedFaqList[index].editorState = newEditorState;
    updatedFaqList[index].answer = stateToHTML(
      newEditorState.getCurrentContent()
    );
    setFaqList(updatedFaqList);
  };

  const handleCodeGeneration = () => {
    const html = generateHtml(faqList, faqTitle);
    setGeneratedCode(html);
  };

  useEffect(() => {
    console.log(generatedCode);
  }, [generatedCode]);

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">
        FAQ Code Generator
      </h1>
      <div className="flex w-full max-w-screen-lg flex-col mx-auto mt-12">
        <div className="flex flex-col gap-4 mb-8">
          <label className="font-semibold text-xl" htmlFor="title">
            FaQ Heading Title
          </label>
          <input
            onChange={(e) => setFaqTitle(e.target.value)}
            className="w-[300px] border border-gray-300 rounded-md m-0 p-2"
            type="text"
            id="title"
            placeholder="Faqs"
          />
        </div>
        {faqList.map((faq, index) => (
          <Card key={index} width={"lg"} className="mb-4 relative">
            <button
              onClick={() => deleteFaqItem(index)}
              className=" absolute top-4 right-4 bg-red-600 text-white font-semibold py-1 px-2 rounded-md">
              Delete
            </button>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <p className="font-semibold col-span-2 text-base">
                {faq.question ? faq.question : `Faq Question ${index + 1}`}
              </p>
              <div className="flex flex-col w-full items-start gap-2">
                <label
                  className="font-semibold text-sm"
                  htmlFor={`faq-question-${index}`}>
                  Question Text
                </label>
                <input
                  className="border w-full border-gray-300 p-2 rounded-md m-0 text-sm"
                  type="text"
                  id={`faq-question-${index}`}
                  value={faq.question}
                  placeholder={`Faq Question ${index + 1}`}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full items-start gap-2">
                <label
                  className="font-semibold text-sm"
                  htmlFor={`faq-answer-${index}`}>
                  Answer Text
                </label>
                <div className="border border-gray-300 rounded-md w-full min-h-[200px]">
                  <Editor
                    editorState={faq.editorState}
                    onEditorStateChange={(newEditorState) =>
                      handleEditorChange(index, newEditorState)
                    }
                    toolbar={{
                      options: ["inline", "list", "link"],
                      inline: { options: ["bold", "italic", "underline"] },
                      list: { options: ["unordered", "ordered"] },
                      link: { options: ["link"] },
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
        <div className="flex items-center gap-4 justify-end">
          <button
            onClick={addFaqItem}
            className="w-fit bg-primary text-white font-semibold py-2 px-4 rounded-md">
            Add FAQ Item
          </button>
          {faqList.length > 0 && (
            <button
              onClick={handleCodeGeneration}
              className="bg-secondary w-fit text-white font-semibold py-2 px-4 rounded-md">
              Generate Code
            </button>
          )}
        </div>
        {generatedCode && (
          <div
            id="generated-code-block"
            className="max-w-screen-lg mx-auto my-8">
            <CopyBlock
              customStyle={{
                maxHeight: "500px",
                overflowY: "auto",
                position: "relative",
              }}
              text={generatedCode}
              language="html"
              showLineNumbers={false}
              wrapLongLines={true}
              theme={dracula}
            />
          </div>
        )}
      </div>
    </>
  );
}
