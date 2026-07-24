import PromptSuggestionButton from "@/app/components/PromptSuggestionButton";


const PromptSuggestionRow = ({ onPromptClick }) => {
    const prompts = [
        "Which teams are in Group A of the 2026 World Cup?",
        "Where is the FIFA World Cup 2026 final being held?",
        "Who are the top scorers in the 2026 World Cup so far?",
        "What is the full match schedule for the Final Round?",
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) =>
                <PromptSuggestionButton
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
                />)}
        </div>
    )
}

export default PromptSuggestionRow