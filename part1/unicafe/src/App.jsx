import { useState } from 'react'

const Button = ({ handleClick, text }) => (
    <button onClick={handleClick}>
        {text}
    </button>
)

const StatisticLine = ({ text, value }) => (
    <tr>
        <td>{text}</td>
        <td>{value}</td>
    </tr>
)

const Statistics = (props) => {
    const { good, neutral, bad, expressive } = props
    const total = good + neutral + bad + expressive
    const average = total === 0 ? 0 : (good - bad) / total
    const positive = total === 0 ? 0 : (good / total) * 100

    if (total === 0) {
        return (
            <div>
                <h1>statistics</h1>
                <p>No feedback given</p>
            </div>
        )
    }

    return (
        <div>
            <h1>statistics</h1>
            <table>
                <tbody>
                    <StatisticLine text="good" value={good} />
                    <StatisticLine text="neutral" value={neutral} />
                    <StatisticLine text="bad" value={bad} />
                    <StatisticLine text="expressive" value={expressive} />
                    <StatisticLine text="all" value={total} />
                    <StatisticLine text="average" value={average} />
                    <StatisticLine text="positive" value={positive + " %"} />
                </tbody>
            </table>
        </div>
    )
}

const App = () => {
    const [good, setGood] = useState(0)
    const [neutral, setNeutral] = useState(0)
    const [bad, setBad] = useState(0)
    const [expressive, setExpressive] = useState(0)

    return (
        <div>
            <h1>give feedback</h1>
            <Button handleClick={() => setGood(good + 1)} text="good" />
            <Button handleClick={() => setNeutral(neutral + 1)} text="neutral" />
            <Button handleClick={() => setBad(bad + 1)} text="bad" />
            <Button handleClick={() => setExpressive(expressive + 1)} text="expressive" />
            <Statistics good={good} neutral={neutral} bad={bad} expressive={expressive} />
        </div>
    )
}

export default App
