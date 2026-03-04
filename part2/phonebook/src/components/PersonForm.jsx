const PersonForm = ({ addPerson, newName, handleNameChange, newNumber, handleNumberChange, newPlace, handlePlaceChange }) => {
    return (
        <form onSubmit={addPerson}>
            <div>
                name: <input value={newName} onChange={handleNameChange} />
            </div>
            <div>
                number: <input value={newNumber} onChange={handleNumberChange} />
            </div>
            <div>
                place: <input value={newPlace} onChange={handlePlaceChange} />
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    )
}

export default PersonForm
