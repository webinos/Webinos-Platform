///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:05
// Code is generated using templates: SD.TemplateBindings.SqlServerSpecific.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Configuration;

using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.HelperClasses
{
	/// <summary>
	/// General utility methods used for SqlServer usage by the framework. 
	/// </summary>
	public partial class DbUtils
	{
		#region Public Static Members
		public static string ActualConnectionString = string.Empty;
		#endregion

		#region Constants
		private const string connectionKeyString = "Main.ConnectionString";
		#endregion

		#region Class Member Declarations
		private static int _commandTimeOut = 30;
		#endregion

		/// <summary>
		/// Private CTor, no instatiation possible
		/// </summary>
		private DbUtils()
		{
		}


		/// <summary>
		/// Sets the flag to signal the SqlServer DQE to generate SET ARITHABORT ON statements prior to INSERT, DELETE and UPDATE Queries.
		/// Keep this flag to false in normal usage, but set it to true if you need to write into a table which is part of an indexed view.
		/// It will not affect normal inserts/updates that much, leaving it on is not harmful. See Books online for details on SET ARITHABORT ON.
		/// After each statement the setting is turned off if it has been turned on prior to that statement.
		/// </summary>
		/// <remarks>Setting this flag is a global change.</remarks>
		public static void SetArithAbortFlag(bool value)
		{
			SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.ArithAbortOn = value;
		}

		/// <summary>
		/// Compatibility level used by the DQE. Default is SqlServer2000. To utilize SqlServer 2005 specific features, set this parameter 
		/// to SqlServer2005, either through a setting in the .config file of your application or by setting this parameter once in your application.
		/// Compatibility level influences the query generated for paging, sequence name (@@IDENTITY/SCOPE_IDENTITY()), and usage of newsequenceid() in inserts. 
		/// It also influences the provider to use. This way you can switch between SqlServer server client 'SqlClient' and SqlServer CE Desktop. 
		/// </summary>
		/// <remarks>Setting this property will overrule a similar setting in the .config file. Don't set this property when queries are executed as
		/// it might switch factories for ADO.NET elements which could result in undefined behavior. Set this property at startup of your application as it's
		/// a global setting (affects all queries in your application using this DQE)</remarks>
		public static void SetSqlServerCompatibilityLevel(SqlServerCompatibilityLevel compatibilityLevel)
		{
			SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.CompatibilityLevel = compatibilityLevel;
		}

		/// <summary>
		/// Creates a new SqlConnection
		/// </summary>
		/// <param name="connectionString">Conectionstring To use</param>
		/// <returns>A ready to use, closed, sqlconnection object</returns>
		public static DbConnection CreateConnection(string connectionString)
		{
			DbConnection toReturn = SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.FactoryToUse.CreateConnection();
			toReturn.ConnectionString = connectionString;
			return toReturn;
		}


		/// <summary>
		/// Creates a new closed SqlConnection object based on the connection string read from the *.config file of the appdomain.
		/// The connection string is stored in a key with the name defined in the constant connectionKeyString, mentioned above.
		/// </summary>
		/// <returns>A ready to use, closed, sqlconnection object</returns>
		public static DbConnection CreateConnection()
		{
			if(ActualConnectionString==string.Empty)
			{
				ActualConnectionString = ConfigFileHelper.ReadConnectionStringFromConfig( connectionKeyString);
			}

			return CreateConnection(ActualConnectionString);
		}


		/// <summary>
		/// Determines which connection to use: the connection held by the passed in transaction (if any) or a new one (if no Transaction was passed in)
		/// </summary>
		/// <param name="containingTransaction">A transaction the caller participates in. If null, the caller is not participating in a transaction</param>
		/// <returns>A ready to use connection object</returns>
		public static IDbConnection DetermineConnectionToUse(ITransaction containingTransaction)
		{
			if((containingTransaction!=null)&&(containingTransaction.ConnectionToUse!=null))
			{
				return containingTransaction.ConnectionToUse;
			}
			else
			{
				return CreateConnection();
			}
		}


		/// <summary>
		/// Creates a new SqlDataAdapter.
		/// </summary>
		/// <returns></returns>
		public static DbDataAdapter CreateDataAdapter()
		{
			return SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.FactoryToUse.CreateDataAdapter();
		}


		/// <summary>
		/// Creates a new SqlServer transaction
		/// </summary>
		/// <param name="connectionToUse">the connection to use</param>
		/// <param name="isolationLevelToUse">the isolation level to use</param>
		/// <param name="name">the name for the transaction</param>
		/// <returns>new SqlTransaction object.</returns>
		public static IDbTransaction CreateTransaction(IDbConnection connectionToUse, IsolationLevel isolationLevelToUse, string name)
		{
			return connectionToUse.BeginTransaction(isolationLevelToUse);
		}


		/// <summary>
		/// Calls the specified action stored procedure in the SqlServer database a newly created connection is connecting to. 
		/// </summary>
		/// <param name="storedProcedureToCall">Stored procedure to call</param>
		/// <param name="parameters">array of parameters to specify</param>
		/// <param name="transactionToUse">the transaction to use, or null if no transaction is available.</param>
		/// <returns>the amount of rows affected. This value will be -1 if the stored procedure sets ROWCOUNT to OFF or this has
		/// been disabled in the catalog by other settings.</returns>
		public static int CallActionStoredProcedure(string storedProcedureToCall, SqlParameter[] parameters, ITransaction transactionToUse )
		{
			SqlCommand command = null;
			bool connectionOpenedLocally = false;
			string procName = SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.GetNewStoredProcedureName(storedProcedureToCall);
			if(transactionToUse!=null)
			{
				command = new SqlCommand(procName, (SqlConnection)transactionToUse.ConnectionToUse);
				command.Transaction = (SqlTransaction)transactionToUse.PhysicalTransaction;
			}
			else
			{
				command = new SqlCommand(procName, (SqlConnection)CreateConnection());
			}
			command.CommandType = CommandType.StoredProcedure;
			command.CommandTimeout = _commandTimeOut;

			int toReturn = -1;
			try
			{
				for(int i=0;i<parameters.Length;i++)
				{
					command.Parameters.Add(parameters[i]);
				}

				if(command.Connection.State!=ConnectionState.Open)
				{
					command.Connection.Open();
					connectionOpenedLocally = true;
				}
				toReturn = command.ExecuteNonQuery();
			}
			finally
			{
				if(connectionOpenedLocally)
				{
					command.Connection.Close();
					command.Connection.Dispose();
				}
				command.Dispose();
			}
			return toReturn;
		}


		/// <summary>
		/// Calls the specified retrieval stored procedure in the SqlServer database a newly created connection is connecting to. Fills the
		/// specified datatable. 
		/// </summary>
		/// <param name="storedProcedureToCall">Stored procedure to call</param>
		/// <param name="parameters">array of parameters to specify</param>
		/// <param name="tableToFill">Datatable to fill by the stored procedure</param>
		/// <param name="transactionToUse">the transaction to use, or null if no transaction is available.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public static bool CallRetrievalStoredProcedure(string storedProcedureToCall, SqlParameter[] parameters, DataTable tableToFill, ITransaction transactionToUse)
		{
			SqlCommand command = null;
			string procName = SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.GetNewStoredProcedureName(storedProcedureToCall);
			if(transactionToUse!=null)
			{
				command = new SqlCommand(procName, (SqlConnection)transactionToUse.ConnectionToUse);
				command.Transaction = (SqlTransaction)transactionToUse.PhysicalTransaction;
			}
			else
			{
				command = new SqlCommand(procName, (SqlConnection)CreateConnection());
			}
			command.CommandType = CommandType.StoredProcedure;
			command.CommandTimeout = _commandTimeOut;

			SqlDataAdapter adapter = new SqlDataAdapter(command);
			for(int i=0;i<parameters.Length;i++)
			{
				command.Parameters.Add(parameters[i]);
			}
			try
			{
				adapter.Fill(tableToFill);
			}
			finally
			{
				command.Dispose();
				adapter.Dispose();
			}
			return true;
		}


		/// <summary>
		/// Calls the specified retrieval stored procedure in the SqlServer database a newly created connection is connecting to. Fills the
		/// specified DataSet. 
		/// </summary>
		/// <param name="storedProcedureToCall">Stored procedure to call</param>
		/// <param name="parameters">array of parameters to specify</param>
		/// <param name="dataSetToFill">DataSet to fill by the stored procedure</param>
		/// <param name="transactionToUse">the transaction to use, or null if no transaction is available.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public static bool CallRetrievalStoredProcedure(string storedProcedureToCall, SqlParameter[] parameters, DataSet dataSetToFill, ITransaction transactionToUse)
		{
			SqlCommand command = null;
			string procName = SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.GetNewStoredProcedureName(storedProcedureToCall);
			if(transactionToUse!=null)
			{
				command = new SqlCommand(procName, (SqlConnection)transactionToUse.ConnectionToUse);
				command.Transaction = (SqlTransaction)transactionToUse.PhysicalTransaction;
			}
			else
			{
				command = new SqlCommand(procName, (SqlConnection)CreateConnection());
			}
			command.CommandType = CommandType.StoredProcedure;
			command.CommandTimeout = _commandTimeOut;

			SqlDataAdapter adapter = new SqlDataAdapter(command);
			for(int i=0;i<parameters.Length;i++)
			{
				command.Parameters.Add(parameters[i]);
			}
			try
			{
				adapter.Fill(dataSetToFill);
			}
			finally
			{
				command.Dispose();
				adapter.Dispose();
			}

			return true;
		}


		#region Class Property Declarations
		/// <summary>
		/// Gets / sets the command time out (in seconds). This is a global setting, so every Command object created after you've set this
		/// property to a value will have that value as CommandTimeOut. Default is 30 seconds which is the ADO.NET default.
		/// </summary>
		public static int CommandTimeOut
		{
			get
			{
				return _commandTimeOut;
			}
			set
			{
				_commandTimeOut = value;
				SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.CommandTimeOut = _commandTimeOut;
			}
		}
		#endregion


		#region Included Code

		#endregion
	}
}
