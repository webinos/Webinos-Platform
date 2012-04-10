///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:05
// Code is generated using templates: SD.TemplateBindings.SqlServerSpecific.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
#if !CEDesktop
using System;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Configuration;
using System.EnterpriseServices;

using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.HelperClasses
{
	/// <summary>
	/// General utility class for COM+ transactions. 
	/// </summary>
	[Transaction(TransactionOption.Required)]
	public partial class DbUtilsComPlus : ServicedComponent
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
		/// CTor
		/// </summary>
		public DbUtilsComPlus()
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
		/// Sets the compatibility level used by the DQE. Default is SqlServer2000. To utilize SqlServer 2005 specific features, set this parameter 
		/// to SqlServer2005, either through a setting in the .config file of your application or by calling this method once in your application.
		/// Compatibility level influences the query generated for paging, sequence name (@@IDENTITY/SCOPE_IDENTITY()), and usage of newsequenceid() in inserts. 
		/// </summary>
		/// <parameter name="compatibilityLevel">the compatibility level the DQE should be running on. Default is SqlServer 2000 and up.</parameter>
		/// <remarks>Setting the compatibility level is a global change. Calling this method will overrule a similar setting in the .config file.</remarks>
		public static void SetSqlServerCompatibilityLevel(SqlServerCompatibilityLevel compatibilityLevel)
		{
			SD.LLBLGen.Pro.DQE.SqlServer.DynamicQueryEngine.CompatibilityLevel = compatibilityLevel;
		}

		/// <summary>
		/// Creates a new SqlConnection
		/// </summary>
		/// <param name="connectionString">Conectionstring To use</param>
		/// <returns>A ready to use, closed, sqlconnection object</returns>
		public SqlConnection CreateConnection(string connectionString)
		{
			return new SqlConnection(connectionString);
		}

		/// <summary>
		/// Creates a new closed SqlConnection object based on the connection string read from the *.config file of the appdomain.
		/// The connection string is stored in a key with the name defined in the constant connectionKeyString, mentioned above.
		/// </summary>
		/// <returns>A ready to use, closed, sqlconnection object</returns>
		public SqlConnection CreateConnection()
		{
			if(ActualConnectionString==string.Empty)
			{
				ActualConnectionString = ConfigFileHelper.ReadConnectionStringFromConfig( connectionKeyString);
			}

			return CreateConnection(ActualConnectionString);
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
#endif