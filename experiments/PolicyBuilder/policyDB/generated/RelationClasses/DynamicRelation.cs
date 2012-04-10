///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
//////////////////////////////////////////////////////////////
using System;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{

	/// <summary>
	/// Class to define dynamic relations for queries. 
	/// </summary>
	/// <remarks>Dynamic relations are only supported in ansi joins. If you're using Oracle on 8i, you can't use Dynamic Relations. In all other cases
	/// you can. In the case of Oracle 9i: specify that you want to use Ansi joins (recommended) by setting the config file setting 'OracleAnsiJoins' to true</remarks>
	[Serializable]
	public class DynamicRelation : DynamicRelationBase
	{
		/// <summary>Initializes a new instance of the <see cref="DynamicRelation"/> class.</summary>
		/// <param name="leftOperand">The left operand, which can only be a derived table definition. No join will take place. </param>
		/// <remarks>If a DynamicRelation is created with this CTor, it has to be the only one. It will be ignored if there are more
		/// relations in the relation collection.</remarks>
		public DynamicRelation(DerivedTableDefinition leftOperand)
		{
			base.InitClass(JoinHint.None, string.Empty, string.Empty, null, leftOperand, null);
		}
	
		/// <summary>
		/// Initializes a new instance of the <see cref="DynamicRelation"/> class.
		/// </summary>
		/// <param name="leftOperand">The left operand.</param>
		/// <param name="joinType">Type of the join. If None is specified, Inner is assumed.</param>
		/// <param name="rightOperand">The right operand.</param>
		/// <param name="onClause">The on clause for the join.</param>
		public DynamicRelation(DerivedTableDefinition leftOperand, JoinHint joinType, DerivedTableDefinition rightOperand, IPredicate onClause)
		{
			base.InitClass(joinType, string.Empty, string.Empty, onClause, leftOperand, rightOperand);
		}
	
		/// <summary>Initializes a new instance of the <see cref="DynamicRelation"/> class.</summary>
		/// <param name="leftOperand">The left operand.</param>
		/// <param name="joinType">Type of the join. If None is specified, Inner is assumed.</param>
		/// <param name="rightOperand">The right operand which is an entity type.</param>
		/// <param name="aliasRightOperand">The alias of the right operand. If you don't want to / need to alias the right operand (only alias if you have to), specify string.Empty.</param>
		/// <param name="onClause">The on clause for the join.</param>
		public DynamicRelation(DerivedTableDefinition leftOperand, JoinHint joinType, policyDB.EntityType rightOperand, string aliasRightOperand, IPredicate onClause)
		{
			base.InitClass(joinType, string.Empty, aliasRightOperand, onClause, leftOperand, GeneralEntityFactory.Create(rightOperand));
		}
	
		/// <summary>Initializes a new instance of the <see cref="DynamicRelation"/> class.</summary>
		/// <param name="leftOperand">The left operand, which is an entity.</param>
		/// <param name="joinType">Type of the join. If None is specified, Inner is assumed.</param>
		/// <param name="rightOperand">The right operand which is an entity.</param>
		/// <param name="aliasLeftOperand">The alias of the left operand. If you don't want to / need to alias the left operand (only alias if you have to), specify string.Empty.</param>
		/// <param name="aliasRightOperand">The alias of the right operand. If you don't want to / need to alias the right operand (only alias if you have to), specify string.Empty.</param>
		/// <param name="onClause">The on clause for the join.</param>
		public DynamicRelation(policyDB.EntityType leftOperand, JoinHint joinType, policyDB.EntityType rightOperand, string aliasLeftOperand, string aliasRightOperand, IPredicate onClause)
		{
			base.InitClass(joinType, aliasLeftOperand, aliasRightOperand, onClause, GeneralEntityFactory.Create(leftOperand), GeneralEntityFactory.Create(rightOperand));
		}
		
		/// <summary>Gets the inheritance provider for inheritance info retrieval for entity operands</summary>
		/// <returns>The inheritance info provider</returns>
		protected override IInheritanceInfoProvider GetInheritanceProvider()
		{
			return InheritanceInfoProviderSingleton.GetInstance();
		}
	}

}