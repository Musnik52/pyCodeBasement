import React, { useState } from "react";
import Button from "../../UI/Button/Button";

const RemoveForm = (props) => {
  const [removeId, setRemoveId] = useState([]);
  const myInput = props.myInput;

  const removeHandler = (event) => {
    setRemoveId(event.target.value);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const delData = {
      username: props.username,
      password: props.pwd,
      id: removeId,
    };
    props.onSubmit(delData);
    setRemoveId("");
  };

  return (
    <form onSubmit={submitHandler}>
      <label className="text-decoration-underline">
        Select ID # To Remove
      </label>
      <br />
      <br />
      <select
        aria-label="Default select example"
        onChange={removeHandler}
      >
        <option selected value={0} />
        {myInput.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id}
          </option>
        ))}
      </select>
      <Button className="control" type="submit">
        Remove Customer
      </Button>
    </form>
  );
};

export default RemoveForm;