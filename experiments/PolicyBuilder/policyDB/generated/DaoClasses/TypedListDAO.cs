///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:05
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
//////////////////////////////////////////////////////////////
using System;
using System.Data;
using System.Data.Common;
using policyDB.HelperClasses;

using SD.LLBLGen.Pro.ORMSupportClasses;
using SD.LLBLGen.Pro.DQE.SqlServer;


namespace policyDB.DaoClasses
{
	/// <summary>
	/// Generic DAO class for usage with Typed list classes.
	/// </summary>
	public partial class TypedListDAO : DaoBase
	{
		/// <summary>CTor</summary>
		public TypedListDAO() : base(InheritanceInfoProviderSingleton.GetInstance(), new DynamicQueryEngine(), InheritanceHierarchyType.None, string.Empty, null)
		{
		}

		/// <summary>
		/// Retrieves rows in the datatable provided which match the specified filter, containing the fields specified. It will always create a new connection to the database.
		/// </summary>
		/// <param name="fieldsToReturn">IEntityFields implementation which forms the definition of the resultset to return.</param>
		/// <param name="tableToFill">The datatable to fill with the rows retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When null is specified, no sorting is applied.</param>
		/// <param name="selectFilter">A predicate or predicate expression which should be used as filter for the entities to retrieve.</param>
		/// <param name="relations">The set of relations to walk to construct to total query.</param>
		/// <param name="allowDuplicates">Flag to allow duplicate rows or not</param>
		/// <param name="groupByClause">The list of fields to group by on. When not specified or an empty collection is specified, no group by clause
		/// is added to the query. A check is performed for each field in the selectList. If a field in the selectList is not present in the groupByClause collection, an exception is thrown.</param>
		/// <param name="transactionToUse">The transaction object to use. Can be null. If specified, the connection object of the transaction is used to fill the TypedView, which avoids deadlocks on SqlServer.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiAsDataTable(IEntityFields fieldsToReturn, DataTable tableToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IPredicate selectFilter, IRelationCollection relations, bool allowDuplicates, IGroupByCollection groupByClause, ITransaction transactionToUse, int pageNumber, int pageSize)
		{
			return base.PerformGetMultiAsDataTableAction(fieldsToReturn, tableToFill, maxNumberOfItemsToReturn, sortClauses, selectFilter, relations, allowDuplicates, groupByClause, transactionToUse, pageNumber, pageSize);
		}
		
		/// <summary>
		/// Determines the connection to use. If transaction to use is null, a new connection is created, otherwise the connection of the transaction is used.
		/// </summary>
		/// <param name="transactionToUse">Transaction to use.</param>
		/// <returns>a ready to use connection object.</returns>
		protected override IDbConnection DetermineConnectionToUse(ITransaction transactionToUse)
		{
			return DbUtils.DetermineConnectionToUse(transactionToUse);
		}
		
		/// <summary>
		/// Creates a new ADO.NET data adapter.
		/// </summary>
		/// <returns>ready to use ADO.NET data-adapter</returns>
		protected override DbDataAdapter CreateDataAdapter()
		{
			return DbUtils.CreateDataAdapter();
		}
		
		#region Included Code

		#endregion
	}
}
