///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:05
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Data;
using System.Data.Common;
using System.Collections;

using policyDB.EntityClasses;
using policyDB.FactoryClasses;
using policyDB.CollectionClasses;
using policyDB.HelperClasses;
using policyDB;

using SD.LLBLGen.Pro.ORMSupportClasses;
using SD.LLBLGen.Pro.DQE.SqlServer;


namespace policyDB.DaoClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END

	/// <summary>
	/// General DAO class for the Rule Entity. It will perform database oriented actions for
	/// a entity of type 'RuleEntity'. This DAO works on an EntityFields object. 
	/// </summary>
	public partial class RuleDAO : DaoBase
	{
		/// <summary>CTor</summary>
		public RuleDAO() : base(InheritanceInfoProviderSingleton.GetInstance(), new DynamicQueryEngine(), InheritanceHierarchyType.None, "RuleEntity", new RuleEntityFactory())
		{
		}
		
		/// <summary>CTor</summary>
		/// <param name="inheritanceInfoProviderToUse">Inheritance info provider to use.</param>
		/// <param name="dqeToUse">Dqe to use.</param>
		/// <param name="typeOfInheritance">Type of inheritance.</param>
		/// <param name="entityName">Name of the entity.</param>
		/// <param name="entityFactory">Entity factory.</param>
		internal RuleDAO(IInheritanceInfoProvider inheritanceInfoProviderToUse, DynamicQueryEngineBase dqeToUse, InheritanceHierarchyType typeOfInheritance, string entityName, IEntityFactory entityFactory) : base(inheritanceInfoProviderToUse, dqeToUse, typeOfInheritance, entityName, entityFactory)
		{
		}


		/// <summary>
		/// Retrieves in the calling RuleCollection object all RuleEntity objects which have data in common
		/// with the specified related Entities. If one is omitted, that entity is not used as a filter. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. 
		/// When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="filter">Extra filter to limit the resultset. Predicate expression can be null, in which case it will be ignored.</param>
		/// <param name="conditionInstance">DecisionNodeEntity instance to use as a filter for the RuleEntity objects to return</param>
		/// <param name="effectInstance">EffectEntity instance to use as a filter for the RuleEntity objects to return</param>
		/// <param name="policyInstance">PolicyEntity instance to use as a filter for the RuleEntity objects to return</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		public bool GetMulti(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IPredicateExpression filter, IEntity conditionInstance, IEntity effectInstance, IEntity policyInstance, int pageNumber, int pageSize)
		{
			base.EntityFactoryToUse = entityFactoryToUse;
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.RuleEntity);
			IPredicateExpression selectFilter = CreateFilterUsingForeignKeys(conditionInstance, effectInstance, policyInstance, fieldsToReturn);
			if(filter!=null)
			{
				selectFilter.AddWithAnd(filter);
			}
			return base.PerformGetMultiAction(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, selectFilter, null, null, null, pageNumber, pageSize);
		}

		/// <summary>
		/// Retrieves entities of the type 'RuleEntity' in a datatable which match the specified filter. 
		/// It will always create a new connection to the database.
		/// </summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. 
		/// When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="selectFilter">A predicate or predicate expression which should be used as filter for the entities to retrieve.</param>
		/// <param name="relations">The set of relations to walk to construct to total query.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>a filled datatable if succeeded, false otherwise</returns>
		public virtual DataTable GetMultiAsDataTable(long maxNumberOfItemsToReturn, ISortExpression sortClauses, IPredicate selectFilter, IRelationCollection relations, int pageNumber, int pageSize)
		{
			return base.PerformGetMultiAsDataTableAction(maxNumberOfItemsToReturn, sortClauses, selectFilter, relations, pageNumber, pageSize);
		}

	
		/// <summary>
		/// Deletes from the persistent storage all 'Rule' entities which have data in common
		/// with the specified related Entities. If one is omitted, that entity is not used as a filter. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="conditionInstance">DecisionNodeEntity instance to use as a filter for the RuleEntity objects to delete</param>
		/// <param name="effectInstance">EffectEntity instance to use as a filter for the RuleEntity objects to delete</param>
		/// <param name="policyInstance">PolicyEntity instance to use as a filter for the RuleEntity objects to delete</param>
		/// <returns>Amount of entities affected, if the used persistent storage has rowcounting enabled.</returns>
		public int DeleteMulti(ITransaction containingTransaction, IEntity conditionInstance, IEntity effectInstance, IEntity policyInstance)
		{
			IEntityFields fields = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.RuleEntity);
			IPredicateExpression deleteFilter = CreateFilterUsingForeignKeys(conditionInstance, effectInstance, policyInstance, fields);
			return base.DeleteMulti(containingTransaction, deleteFilter);
		}

		/// <summary>
		/// Updates all entities of the same type or subtype of the entity <i>entityWithNewValues</i> directly in the persistent storage if they match the filter
		/// supplied in <i>filterBucket</i>. Only the fields changed in entityWithNewValues are updated for these fields. Entities of a subtype of the type
		/// of <i>entityWithNewValues</i> which are affected by the filterBucket's filter will thus also be updated. 
		/// </summary>
		/// <param name="entityWithNewValues">IEntity instance which holds the new values for the matching entities to update. Only changed fields are taken into account</param>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="conditionInstance">DecisionNodeEntity instance to use as a filter for the RuleEntity objects to update</param>
		/// <param name="effectInstance">EffectEntity instance to use as a filter for the RuleEntity objects to update</param>
		/// <param name="policyInstance">PolicyEntity instance to use as a filter for the RuleEntity objects to update</param>
		/// <returns>Amount of entities affected, if the used persistent storage has rowcounting enabled.</returns>
		public int UpdateMulti(IEntity entityWithNewValues, ITransaction containingTransaction, IEntity conditionInstance, IEntity effectInstance, IEntity policyInstance)
		{
			IEntityFields fields = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.RuleEntity);
			IPredicateExpression updateFilter = CreateFilterUsingForeignKeys(conditionInstance, effectInstance, policyInstance, fields);
			return base.UpdateMulti(entityWithNewValues, containingTransaction, updateFilter);
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


		/// <summary>
		/// Creates a PredicateExpression which should be used as a filter when any combination of available foreign keys is specified.
		/// </summary>
		/// <param name="conditionInstance">DecisionNodeEntity instance to use as a filter for the RuleEntity objects</param>
		/// <param name="effectInstance">EffectEntity instance to use as a filter for the RuleEntity objects</param>
		/// <param name="policyInstance">PolicyEntity instance to use as a filter for the RuleEntity objects</param>
		/// <param name="fieldsToReturn">IEntityFields implementation which forms the definition of the fieldset of the target entity.</param>
		/// <returns>A ready to use PredicateExpression based on the passed in foreign key value holders.</returns>
		private IPredicateExpression CreateFilterUsingForeignKeys(IEntity conditionInstance, IEntity effectInstance, IEntity policyInstance, IEntityFields fieldsToReturn)
		{
			IPredicateExpression selectFilter = new PredicateExpression();
			
			if(conditionInstance != null)
			{
				selectFilter.Add(new FieldCompareValuePredicate(fieldsToReturn[(int)RuleFieldIndex.ConditionId], ComparisonOperator.Equal, ((DecisionNodeEntity)conditionInstance).Id));
			}
			if(effectInstance != null)
			{
				selectFilter.Add(new FieldCompareValuePredicate(fieldsToReturn[(int)RuleFieldIndex.EffectId], ComparisonOperator.Equal, ((EffectEntity)effectInstance).Id));
			}
			if(policyInstance != null)
			{
				selectFilter.Add(new FieldCompareValuePredicate(fieldsToReturn[(int)RuleFieldIndex.PolicyId], ComparisonOperator.Equal, ((PolicyEntity)policyInstance).Id));
			}
			return selectFilter;
		}

		#region Custom DAO code
		
		// __LLBLGENPRO_USER_CODE_REGION_START CustomDAOCode
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion
		
		#region Included Code

		#endregion
	}
}
