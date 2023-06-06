from typing import TypeVar

from langchain import LLMChain, BasePromptTemplate
from langchain.schema import OutputParserException, BaseOutputParser
from openai import InvalidRequestError
from openai.error import ServiceUnavailableError

from agent_backend.schemas import ModelSettings
from agent_backend.web.api.agent.model_settings import create_model
from agent_backend.web.api.errors import OpenAIError

T = TypeVar("T")


def parse_with_handling(parser: BaseOutputParser[T], completion: str) -> T:
    try:
        return parser.parse(completion)
    except OutputParserException as e:
        raise OpenAIError(
            e, "There was an issue parsing the response from the AI model."
        )

# 调用模型进行处理
async def call_model_with_handling(
    model_settings: ModelSettings,
    prompt: BasePromptTemplate, 
    args: dict[str, str]
) -> str:
    try:
        model = create_model(model_settings)
        chain = LLMChain(llm=model, prompt=prompt)
        print("chain:",chain)
        result = await chain.arun(args)
        print("result:",result)

        return result
    except ServiceUnavailableError as e:
        raise OpenAIError(
            e,
            "OpenAI is experiencing issues. Visit "
            "https://status.openai.com/ for more info.",
        )
    except InvalidRequestError as e:
        raise OpenAIError(e, e.user_message)
    except Exception as e:
        raise OpenAIError(e, "There was an issue getting a response from the AI model.")
