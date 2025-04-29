import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SplitBalanceApp = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitWith: [],
    splitEqually: true,
  });

  // Calculate balances between users
  const [balances, setBalances] = useState([]);

   useEffect(() => {
     calculateBalances();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [expenses ,users]);                              

  const calculateBalances = () => {
    if (users.length === 0) return;

    // Initialize all balances to zero
    let balanceMap = {};
    users.forEach(user => {
      balanceMap[user] = {};
      users.forEach(otherUser => {
        if (user !== otherUser) {
          balanceMap[user][otherUser] = 0;
        }
      });
    });

    // Calculate balances based on expenses
    expenses.forEach(expense => {
      const payer = expense.paidBy;
      const totalAmount = parseFloat(expense.amount);
      const splitWith = expense.splitWith;
      
      if (splitWith.length === 0) return;
       
    console.log('Expense:', expense.description);
    console.log('Total Amount:', totalAmount);
    console.log('Payer:', payer);
    console.log('Split With:', splitWith);
     //here i am updating....

// Calculate all unique participants (including payer)
const allParticipants = [...new Set([...splitWith, payer])];
console.log('All Participants:', allParticipants); 
// Calculate per person share
const amountPerPerson = totalAmount / allParticipants.length;
console.log('Amount Per Person:', amountPerPerson);




// For each person in the split, update the balance
splitWith.forEach(person => {
  if (person !== payer) {
    // Non-payers owe their share to the payer
    console.log(`${person} owes ${payer} ${amountPerPerson}`);
    balanceMap[person][payer] += amountPerPerson;
    balanceMap[payer][person] -= amountPerPerson;
  }else {
    // Payer is also in splitWith, skip self-payment
    console.log(`Skipping ${payer} (self-payment)`);
  // Payer's own share is already accounted for (they paid upfront)
}
    });

  });
    // Simplify balances to a list format for rendering
    // let balanceList = [];
   
    // users.forEach(user => {
    //   users.forEach(otherUser => {
    //     if (user < otherUser) { // Avoid duplicates
    //       const balance = balanceMap[user][otherUser];
    //       const netBalance = balance - balanceMap[otherUser][user];

    let balanceList = [];
    users.forEach(user => {
      users.forEach(otherUser => {
        if (user < otherUser) { // Avoid duplicates
          const balance = balanceMap[user][otherUser];
          // const reversedBalance = balanceMap[otherUser][user];
          // console.log(`Balance ${user} -> ${otherUser}: ${balance}`);
          // console.log(`Balance ${otherUser} -> ${user}: ${reversedBalance}`);
          
          // const netBalance = balance - reversedBalance;
          // console.log(`Net balance: ${netBalance}`);

          if (Math.abs(balance) > 0.01) {
            balanceList.push({
              from: balance > 0 ? user : otherUser,
              to: balance > 0 ? otherUser : user,
              amount: Math.abs(balance).toFixed(2)
            });
          }
        }
      });
    });
    console.log("Final balance list:", balanceList); 
    setBalances(balanceList);
  };

  // User management
  const handleAddUser = () => {
    if (newUser.trim() !== '' && !users.includes(newUser.trim())) {
      setUsers([...users, newUser.trim()]);
      setNewUser('');
    }
  };

  const handleRemoveUser = (userToRemove) => {
    setUsers(users.filter(user => user !== userToRemove));
    // Remove this user from any expense splits
    setExpenses(expenses.map(expense => ({
      ...expense,
      splitWith: expense.splitWith.filter(user => user !== userToRemove)
    })));
  };

  // Expense management
  const toggleUserInSplit = (user) => {
    const currentSplitWith = newExpense.splitWith;
    const updatedSplitWith = currentSplitWith.includes(user) 
      ? currentSplitWith.filter(u => u !== user)
      : [...currentSplitWith, user];
    
    setNewExpense({
      ...newExpense,
      splitWith: updatedSplitWith
    });
  };

  const handleAddExpense = () => {
    if (
      newExpense.description.trim() !== '' &&
      newExpense.amount > 0 &&
      newExpense.paidBy &&
      newExpense.splitWith.length > 0
    ) {
      setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
      setNewExpense({
        description: '',
        amount: '',
        paidBy: users[0] || '',
        splitWith: [],
        splitEqually: true,
      });
    }
  };

  const handleRemoveExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  // Render UI
  return (
    <div className="d-flex flex-column vh-100">
      {/* App Header */}
      <header className="bg-primary text-white p-4 shadow">
        <h1 className="h4 fw-bold">Split Expense</h1>
        <p className="small mb-0">Real-time expense splitting and settlement</p>
      </header>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs bg-white">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Add Expense
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
        </li>
      </ul>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-4 overflow-auto bg-light">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="container-fluid p-0">
            {/* Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3 mb-md-0">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="fw-bold text-secondary">Total Users</h2>
                    <p className="display-6 fw-bold text-primary">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="fw-bold text-secondary">Total Expenses</h2>
                    <p className="display-6 fw-bold text-primary">{expenses.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="fw-bold text-secondary">Total Amount</h2>
                    <p className="display-6 fw-bold text-primary">
                    ₹{expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balances Section */}
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-4">Settlements</h2>
                
                {balances.length === 0 ? (
                  <p className="text-muted fst-italic">No balances to settle yet.</p>
                ) : (
                  <ul className="list-group">
                    {balances.map((balance, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-medium text-dark">{balance.from}</span>
                          <span className="mx-2 text-muted">owes</span>
                          <span className="fw-medium text-dark">{balance.to}</span>
                        </div>
                        <span className="fw-bold text-success">₹{balance.amount}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="card">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-4">Recent Expenses</h2>
                
                {expenses.length === 0 ? (
                  <p className="text-muted fst-italic">No expenses added yet.</p>
                ) : (
                  <ul className="list-group">
                    {expenses.slice(-5).reverse().map(expense => (
                      <li key={expense.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">{expense.description}</span>
                          <span className="fw-bold">₹{parseFloat(expense.amount).toFixed(2)}</span>
                        </div>
                        <p className="small text-muted mb-0">
                          Paid by {expense.paidBy}, split with {expense.splitWith.join(', ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Expense Tab */}
        {activeTab === 'expenses' && (
          <div className="card">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-4">Add New Expense</h2>
              
              {users.length < 2 ? (
                <div className="alert alert-warning mb-4">
                  Add at least two users before creating expenses.
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Dinner, Movie tickets, etc."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Paid By
                    </label>
                    <select
                      className="form-select"
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user} value={user}>{user}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Split With
                    </label>
                    <div className="row row-cols-2 row-cols-sm-3 g-2">
                      {users.map(user => (
                        <div key={user} className="col">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`split-${user}`}
                              checked={newExpense.splitWith.includes(user)}
                              onChange={() => toggleUserInSplit(user)}
                            />
                            <label className="form-check-label" htmlFor={`split-${user}`}>{user}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="split-equally"
                      checked={newExpense.splitEqually}
                      onChange={(e) => setNewExpense({...newExpense, splitEqually: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="split-equally">Split equally</label>
                  </div>

                  <button
                    className="btn btn-primary w-100"
                    onClick={handleAddExpense}
                  >
                    Add Expense
                  </button>
                </div>
              )}

              {expenses.length > 0 && (
                <div className="mt-4">
                  <h3 className="h6 fw-bold text-secondary mb-2">All Expenses</h3>
                  <div className="table-responsive" style={{ maxHeight: '16rem' }}>
                    <table className="table table-striped">
                      <thead className="table-light">
                        <tr>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Paid By</th>
                          <th>Split With</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(expense => (
                          <tr key={expense.id}>
                            <td>{expense.description}</td>
                            <td>₹{parseFloat(expense.amount).toFixed(2)}</td>
                            <td>{expense.paidBy}</td>
                            <td>{expense.splitWith.join(', ')}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveExpense(expense.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-4">Manage Users</h2>
              
              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="Add new user"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAddUser}
                >
                  Add
                </button>
              </div>

              {users.length === 0 ? (
                <p className="text-muted fst-italic">No users added yet. Add some users to get started.</p>
              ) : (
                <ul className="list-group">
                  {users.map(user => (
                    <li key={user} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{user}</span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveUser(user)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-3 border-top text-center text-muted">
        <small>Split Balance App - Expense Splitting Made Easy</small>
      </footer>
    </div>
  );
};

export default SplitBalanceApp;