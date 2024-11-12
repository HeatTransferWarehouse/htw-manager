import beautify from "js-beautify";

export const generateHtml = (faqList, faqTitle) => {
  const html = `
      <div class="faq-questions" itemscope itemtype="https://schema.org/FAQPage">
          <h3 style="margin-block: 2rem;">
              <strong>${faqTitle}</strong>
          </h3>
          <div class="faqs-container">
              ${faqList
                .map((faq) => generateQuestionHTML(faq.question, faq.answer))
                .join("\n")}
          </div>
      </div>
    `;

  return beautify.html(html.trim()); // Trim any leading/trailing whitespace
};

const generateQuestionHTML = (question, answer) => {
  return `<div class="faq-question" itemprop="mainEntry" itemscope itemtype="https://schema.org/Question">
              <button class="faq-accordion" itemprop="name">${question}</button>
          </div>
          <div class="faq-answers" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
              <div class="answer-text" itemprop="text">
                  ${answer}
              </div>
          </div>`;
};
